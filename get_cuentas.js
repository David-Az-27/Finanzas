const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://meomsrvaadygulsnblbg.supabase.co';
const supabaseKey = 'sb_publishable_Ah9ovfKYppGuGm3wCC_HHQ_rRE8Tphi';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('cuentas').select('*');
  if (error) {
    console.error('Error fetching cuentas:', error);
    return;
  }
  console.log('Cuentas:');
  data.forEach(c => console.log(`- ${c.nombre} (ID: ${c.id}, es_para_ahorro: ${c.es_para_ahorro})`));
}

main();
