alter table "public"."ai_summaries" alter column "content" set data type jsonb using "content"::jsonb;

alter table "public"."ai_summaries" drop column "type";