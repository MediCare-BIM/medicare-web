CREATE UNIQUE INDEX ai_summaries_patient_id_key ON public.ai_summaries USING btree (patient_id);

alter table "public"."ai_summaries" add constraint "ai_summaries_patient_id_key" UNIQUE using index "ai_summaries_patient_id_key";


