-- Stories table: The world-building root
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID DEFAULT gen_random_uuid(), -- Anonymous user for v1
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chapters table: The nodes of the story tree
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES chapters(id) ON DELETE SET NULL, -- Fork point
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT 'The page is blank...',
    author_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast path querying
CREATE INDEX IF NOT EXISTS idx_chapters_parent_id ON chapters(parent_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
