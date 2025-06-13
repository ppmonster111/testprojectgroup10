-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personal Information (Section 2)
  age INTEGER,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  year_of_study INTEGER,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  bmi DECIMAL(4,2),
  medical_conditions TEXT,
  allergies TEXT,
  surgery_history TEXT,
  faculty VARCHAR(100),
  
  -- Consumption Behavior (Section 3)
  consumption_score INTEGER,
  consumption_data JSONB,
  
  -- Nutrition Knowledge (Section 4)
  nutrition_knowledge_score INTEGER,
  nutrition_skills_score INTEGER,
  nutrition_perception_score INTEGER,
  nutrition_data JSONB,
  
  -- Stress Assessment (Section 5)
  stress_score INTEGER,
  stress_level VARCHAR(20),
  stress_data JSONB,
  
  -- Results
  recommendations TEXT,
  
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
