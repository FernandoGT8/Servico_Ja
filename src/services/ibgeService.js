// API pública do IBGE (sem chave, sem custo) — usada só para listar cidades
// por UF no formulário de contrato. Não é nosso backend, por isso não passa
// por apiFetch (URL e contrato de erro diferentes).
const IBGE_ESTADOS_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

export async function getCidadesPorEstado(uf) {
  if (!uf) return [];

  const response = await fetch(`${IBGE_ESTADOS_URL}/${uf}/municipios`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as cidades do estado selecionado.");
  }

  const municipios = await response.json();
  return municipios
    .map((municipio) => municipio.nome)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}
