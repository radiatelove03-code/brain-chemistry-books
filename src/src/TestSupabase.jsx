import { supabase } from "./lib/supabase"

function TestSupabase() {
async function testConnection() {
console.log("Supabase:", supabase)
}

return ( <button onClick={testConnection}>
Test Supabase </button>
)
}

export default TestSupabase