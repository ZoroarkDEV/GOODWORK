-- Add job_title column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark';

-- Create job_titles table
CREATE TABLE IF NOT EXISTS job_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Insert tech job titles
INSERT INTO job_titles (name, category) VALUES
  ('Software Engineer', 'Tech'),
  ('Senior Software Engineer', 'Tech'),
  ('Tech Lead', 'Tech'),
  ('Engineering Manager', 'Tech'),
  ('CTO', 'Tech'),
  ('Frontend Developer', 'Tech'),
  ('Backend Developer', 'Tech'),
  ('Full Stack Developer', 'Tech'),
  ('DevOps Engineer', 'Tech'),
  ('Site Reliability Engineer', 'Tech'),
  ('Data Engineer', 'Tech'),
  ('Data Scientist', 'Tech'),
  ('Machine Learning Engineer', 'Tech'),
  ('QA Engineer', 'Tech'),
  ('Security Engineer', 'Tech'),
  ('Mobile Developer', 'Tech'),
  ('iOS Developer', 'Tech'),
  ('Android Developer', 'Tech'),
  ('Cloud Architect', 'Tech'),
  ('Solutions Architect', 'Tech'),
  ('Product Manager', 'Tech'),
  ('Product Owner', 'Tech'),
  ('Scrum Master', 'Tech'),
  ('Agile Coach', 'Tech'),
  ('UX Designer', 'Tech'),
  ('UI Designer', 'Tech'),
  ('UX Researcher', 'Tech'),
  ('Technical Writer', 'Tech'),
  ('Developer Advocate', 'Tech'),
  ('Open Source Maintainer', 'Tech')
ON CONFLICT DO NOTHING;