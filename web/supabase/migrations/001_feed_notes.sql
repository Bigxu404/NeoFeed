-- 慢思考知识库：每篇文章对应多条用户想法/灵感
-- 执行后请在 Supabase Dashboard 中运行此 SQL

CREATE TABLE IF NOT EXISTS public.feed_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES public.feeds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  selected_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_notes_feed_id_created_at
  ON public.feed_notes (feed_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_notes_user_id
  ON public.feed_notes (user_id);

ALTER TABLE public.feed_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feed_notes"
  ON public.feed_notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.feed_notes IS '用户对某篇文章的每条想法/灵感，用于慢思考知识库；feeds.user_notes 由 AI 根据本表汇总生成';

-- 一次性回填：将已有 feeds.user_notes 作为一条历史想法插入 feed_notes（执行完建表后可选执行一次）
-- INSERT INTO public.feed_notes (feed_id, user_id, content, created_at)
-- SELECT id, user_id, user_notes, created_at
-- FROM public.feeds
-- WHERE user_notes IS NOT NULL AND trim(user_notes) != '';
-- 回填后可在应用内对该 feed 再保存一条想法以触发 AI 总结，使 feeds.user_notes 与 feed_notes 一致。
