const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../lib/supabase');

// Helper to map saved jobs to frontend expected format
function mapSavedJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    job_id: row.job_id,
    title: row.job_title,
    company: row.company_name,
    location: row.location,
    url: row.job_url,
    job_url: row.job_url, // Keep unified key mapping
    description: row.description,
    created_at: row.created_at
  };
}

// GET /api/jobs/search
// Fetches jobs using the Global Adzuna API with country and region filtering
router.get('/search', async (req, res) => {
  try {
    const { q, location, country } = req.query;
    
    // Retrieve App ID and App Key from environment
    const appId = process.env.ADZUNA_APP_ID ? process.env.ADZUNA_APP_ID.replace(/"/g, '') : null;
    const appKey = process.env.ADZUNA_APP_KEY ? process.env.ADZUNA_APP_KEY.replace(/"/g, '') : null;

    const countryCode = (country || 'in').toLowerCase();

    // FAIL-SAFE FALLBACK: If Adzuna credentials are missing or default, return a premium mock set to avoid page loading freezes
    if (!appId || !appKey || appId.includes('your_actual') || appId === 'undefined') {
      console.log('[JobsRoute] Adzuna credentials not detected. Initializing fail-safe dynamic mock data.');
      
      const searchKeyword = q || 'Software Engineer';
      const searchLoc = location || 'Remote';

      const mockJobs = [
        {
          id: 'mock-1',
          title: `Senior ${searchKeyword} (React / Node)`,
          company: 'Tesla Innovation Labs',
          location: `${searchLoc}, India`,
          url: 'https://www.tesla.com/careers',
          job_url: 'https://www.tesla.com/careers',
          description: `Lead the design and architecture of high-performance user dashboards and control panels. Proficient with advanced state managers and serverless microservices.`,
          tags: ['React', 'Node.js', 'System Design'],
          salary: countryCode === 'in' ? '₹24,00,000 - ₹38,00,000' : '$130,000 - $175,000'
        },
        {
          id: 'mock-2',
          title: `Lead Full-Stack Specialist - ${searchKeyword}`,
          company: 'Google Cloud Platform',
          location: `${searchLoc}, India`,
          url: 'https://careers.google.com',
          job_url: 'https://careers.google.com',
          description: `Architect enterprise-grade software pipelines and high-availability systems. Optimize product features using scalable cloud microservices.`,
          tags: ['Full-Stack', 'Next.js', 'GCP'],
          salary: countryCode === 'in' ? '₹28,00,000 - ₹45,00,000' : '$150,000 - $210,000'
        },
        {
          id: 'mock-3',
          title: `Senior Backend Developer (${searchKeyword})`,
          company: 'Stripe India Systems',
          location: `${searchLoc}, India`,
          url: 'https://stripe.com/jobs',
          job_url: 'https://stripe.com/jobs',
          description: `Construct ultra-secure core banking models and multi-currency payout structures. Write modular, beautifully structured services with 100% test coverage.`,
          tags: ['Node.js', 'PostgreSQL', 'Stripe API'],
          salary: countryCode === 'in' ? '₹18,00,000 - ₹28,00,000' : '$110,000 - $155,000'
        },
        {
          id: 'mock-4',
          title: `Associate Developer - ${searchKeyword}`,
          company: 'Razorpay Payment Gateways',
          location: `${searchLoc}, India`,
          url: 'https://razorpay.com/jobs',
          job_url: 'https://razorpay.com/jobs',
          description: `Contribute to the evolution of payment dashboard components and merchant settlement operations. Ideal for modern React designers.`,
          tags: ['React', 'CSS Grid', 'TailwindCSS'],
          salary: countryCode === 'in' ? '₹9,00,000 - ₹15,00,000' : '$75,000 - $100,000'
        }
      ];

      return res.json(mockJobs);
    }

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`;
    console.log(`[JobsRoute] Querying Adzuna API for country: "${countryCode}", search: "${q || ''}", region: "${location || ''}"`);

    // Prepare search params
    const params = {
      app_id: appId,
      app_key: appKey,
      results_per_page: 20
    };

    if (q) params.what = q;
    if (location) params.where = location;

    const response = await axios.get(adzunaUrl, { params });
    const rawResults = response.data.results || [];

    // Map Adzuna schema elements directly to component expectations
    const mappedJobs = rawResults.map(job => {
      // Safely parse salary details if available
      let salaryStr = 'Open';
      if (job.salary_min || job.salary_max) {
        const minVal = job.salary_min ? Math.round(job.salary_min).toLocaleString() : '';
        const maxVal = job.salary_max ? Math.round(job.salary_max).toLocaleString() : '';
        const currencySymbol = countryCode === 'in' ? '₹' : countryCode === 'gb' ? '£' : countryCode === 'de' ? '€' : '$';
        salaryStr = minVal && maxVal ? `${currencySymbol}${minVal} - ${maxVal}` : minVal ? `${currencySymbol}${minVal}+` : `${currencySymbol}${maxVal}`;
      }

      // Generate tags
      const tags = [];
      if (job.category && job.category.label) tags.push(job.category.label);
      if (job.contract_time) tags.push(job.contract_time.replace('_', ' '));
      if (job.contract_type) tags.push(job.contract_type.replace('_', ' '));
      if (tags.length === 0) tags.push('Full-Time');

      return {
        id: job.id,
        title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // Clean up potential HTML tags in Adzuna titles
        company: job.company?.display_name || 'Premium Recruiter',
        location: job.location?.display_name || 'Remote',
        url: job.redirect_url,
        job_url: job.redirect_url, // Explicitly map as job_url for redirect button actions
        description: job.description.replace(/<\/?[^>]+(>|$)/g, ""), // Clean up HTML from description
        tags: tags,
        salary: salaryStr
      };
    });

    return res.json(mappedJobs);
  } catch (err) {
    console.error('[JobsRoute] Adzuna Search failed:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to retrieve jobs from the Adzuna directory' });
  }
});

// GET /api/jobs/saved
// Get all saved jobs for a specific user
router.get('/saved', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query param is required' });
    }

    const { data: savedJobs, error } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json((savedJobs || []).map(mapSavedJob));
  } catch (err) {
    console.error('[JobsRoute] Fetch saved failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/save
// Save a job listing
router.post('/save', async (req, res) => {
  try {
    const { userId, job } = req.body;
    if (!userId || !job) {
      return res.status(400).json({ error: 'userId and job details are required' });
    }

    const { data, error } = await supabase
      .from('saved_jobs')
      .upsert({
        user_id: userId,
        job_id: job.id.toString(), // Ensure ID is mapped as string
        job_title: job.title,
        company_name: job.company,
        location: job.location,
        job_url: job.job_url || job.url, // Handle both standard key properties
        description: job.description
      }, { onConflict: 'user_id,job_id' })
      .select()
      .single();

    if (error) throw error;

    return res.json(mapSavedJob(data));
  } catch (err) {
    console.error('[JobsRoute] Save job failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/saved/:id
// Unsave/delete a saved job
router.delete('/saved/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Job unsaved successfully' });
  } catch (err) {
    console.error('[JobsRoute] Unsave job failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
