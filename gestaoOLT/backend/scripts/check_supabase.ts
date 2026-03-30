import { supabase } from "@/shared/lib/supabase";

async function main() {
  const url = process.env.SUPABASE_URL;
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !hasKey) {
    console.error("[FAIL] Variáveis ausentes: verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  console.log(`[INFO] Testando acesso ao Supabase em ${url}`);

  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error("[FAIL] Erro ao listar usuários (auth.admin):", error.message);
      process.exit(2);
    }

    console.log("[OK] Consegui autenticar com a service role e acessar auth.admin.");
    console.log(`[OK] Usuários retornados: ${data?.users?.length ?? 0}`);
  } catch (e: any) {
    console.error("[FAIL] Exceção ao acessar Supabase:", e?.message || e);
    process.exit(3);
  }
}

main();

