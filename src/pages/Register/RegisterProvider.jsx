import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { getHomeRoute } from "@/utils/roleRoutes";
import { getCidadesPorEstado } from "@/services/ibgeService";
import { ESTADOS_BR } from "@/data/catalogos";
import {
  RegisterLayout,
  TextField,
  SelectField,
  RadioRows,
  InlineRadioGroup,
  SimNaoField,
  CheckboxGrid,
} from "./RegisterFields";
import { primaryButtonClassName, secondaryButtonClassName } from "./registerFieldsUtils";

const AREAS_ATUACAO = [
  "Construção Civil",
  "Logística",
  "Indústria",
  "Facilities",
  "TI",
  "Saúde",
  "Varejo",
  "Gastronomia",
];

const FAIXAS_EXPERIENCIA = ["Menos de 1 ano", "1-3 anos", "3-5 anos", "Mais de 5 anos"];

const DISPONIBILIDADES = ["Segunda a Sexta", "Feriados", "Fins de semana", "24/7"];

const MOTIVOS_CADASTRO = ["Aumentar renda", "Reduzir custos", "Expandir negócio"];

// Segunda etapa do cadastro do Prestador — conta já existe (criada em
// FirstRegisterProvider, /register/provider). Aqui só completa o perfil
// (CPF, CNPJ/MEI, habilidades...); depois disso o cadastro segue Pendente
// até a validação de CNPJ/documentos e liberação pelo ADMIN/ANALISTA (PRD §3.5).
export default function RegisterProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [dadosGerais, setDadosGerais] = useState({ cpf: "", estado: "", cidade: "" });
  const [cidades, setCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState("");

  useEffect(() => {
    if (!dadosGerais.estado) return;
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregandoCidades(true);
    setErroCidades("");
    getCidadesPorEstado(dadosGerais.estado)
      .then((lista) => {
        if (!cancelado) setCidades(lista);
      })
      .catch(() => {
        if (!cancelado) setErroCidades("Não foi possível carregar as cidades. Tente novamente.");
      })
      .finally(() => {
        if (!cancelado) setCarregandoCidades(false);
      });
    return () => {
      cancelado = true;
    };
  }, [dadosGerais.estado]);

  function handleEstadoChange(uf) {
    // Troca de UF invalida a cidade e a lista antigas.
    setDadosGerais((atual) => ({ ...atual, estado: uf, cidade: "" }));
    setCidades([]);
    setErroCidades("");
  }

  const [documentacao, setDocumentacao] = useState({
    meiCnpj: "",
    cnpj: "",
    clt: "não",
    disponibilidade: "",
  });

  const [habilidades, setHabilidades] = useState({
    areaAtuacao: [],
    experiencia: "",
    nivelConhecimento: "profissional",
    terceirizado: "não",
    motivo: "",
  });

  function handleContinue() {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCompleteProfile() {
    // TODO: endpoint de completar perfil do Prestador ainda não existe no
    // backend (ver BACKEND_ANALISE.md §8). Por ora só segue para a Home do papel.
    navigate(getHomeRoute(user?.tipo, user?.uuid));
  }

  return (
    <RegisterLayout
      title="Bem-vindo ao Serviço Já"
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulputate ut laoreet velit ma."
    >
      {currentStep === 0 && (
        <>
          <TextField
            label="Seu CPF"
            placeholder="123.456.789-11"
            value={dadosGerais.cpf}
            onChange={(e) => setDadosGerais({ ...dadosGerais, cpf: e.target.value })}
          />

          <SelectField
            label="Estado onde mora"
            value={dadosGerais.estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
          >
            <option value="">UF</option>
            {ESTADOS_BR.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Cidade onde mora"
            value={dadosGerais.cidade}
            onChange={(e) => setDadosGerais({ ...dadosGerais, cidade: e.target.value })}
            disabled={!dadosGerais.estado || carregandoCidades}
          >
            <option value="">
              {!dadosGerais.estado
                ? "Selecione o estado primeiro"
                : carregandoCidades
                  ? "Carregando cidades..."
                  : "Cidade"}
            </option>
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>
                {cidade}
              </option>
            ))}
          </SelectField>
          {erroCidades && <p className="text-xs text-red-500">{erroCidades}</p>}

          <button onClick={handleContinue} className={`${primaryButtonClassName} w-full`}>
            Avançar
          </button>
        </>
      )}

      {currentStep === 1 && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600">Você já tem MEI ou CNPJ?</span>
            <RadioRows
              name="meiCnpj"
              value={documentacao.meiCnpj}
              onChange={(value) => setDocumentacao({ ...documentacao, meiCnpj: value })}
              options={[
                { value: "sim", label: "Sim, já tenho MEI" },
                { value: "nao-mas", label: "Não, mas gostaria de ter" },
                { value: "nao", label: "Não tenho interesse em ter" },
              ]}
            />
          </div>

          {documentacao.meiCnpj === "sim" && (
            <TextField
              label="Se sim, insira o CNPJ"
              placeholder="XX.XXX.XXX/XXXX-XX"
              value={documentacao.cnpj}
              onChange={(e) => setDocumentacao({ ...documentacao, cnpj: e.target.value })}
            />
          )}

          <SimNaoField
            label="Você está trabalhando CLT atualmente?"
            name="clt"
            value={documentacao.clt}
            onChange={(value) => setDocumentacao({ ...documentacao, clt: value })}
          />

          <SelectField
            label="Você tem disponibilidade para atuar em quais dias?"
            value={documentacao.disponibilidade}
            onChange={(e) =>
              setDocumentacao({ ...documentacao, disponibilidade: e.target.value })
            }
          >
            <option value="">Disponibilidade - dropdown</option>
            {DISPONIBILIDADES.map((disponibilidade) => (
              <option key={disponibilidade} value={disponibilidade}>
                {disponibilidade}
              </option>
            ))}
          </SelectField>

          <div className="flex items-center justify-between gap-3">
            <button onClick={handleBack} className={secondaryButtonClassName}>
              Voltar
            </button>
            <button onClick={handleContinue} className={primaryButtonClassName}>
              Avançar
            </button>
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <CheckboxGrid
            label="Qual sua área de atuação?"
            max={5}
            values={habilidades.areaAtuacao}
            onChange={(areas) => setHabilidades({ ...habilidades, areaAtuacao: areas })}
            options={AREAS_ATUACAO}
          />

          <SelectField
            label="Quanto tempo de experiência?"
            value={habilidades.experiencia}
            onChange={(e) => setHabilidades({ ...habilidades, experiencia: e.target.value })}
          >
            <option value="">Faixa de tempo - dropdown</option>
            {FAIXAS_EXPERIENCIA.map((faixa) => (
              <option key={faixa} value={faixa}>
                {faixa}
              </option>
            ))}
          </SelectField>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-slate-600">
              Nível de conhecimento na área
            </span>
            <InlineRadioGroup
              name="nivelConhecimento"
              value={habilidades.nivelConhecimento}
              onChange={(value) => setHabilidades({ ...habilidades, nivelConhecimento: value })}
              options={[
                { value: "aprendiz", label: "Aprendiz" },
                { value: "profissional", label: "Profissional" },
                { value: "especialista", label: "Especialista" },
              ]}
            />
          </div>

          <SimNaoField
            label="Já trabalhou como Terceirizado?"
            name="terceirizado"
            value={habilidades.terceirizado}
            onChange={(value) => setHabilidades({ ...habilidades, terceirizado: value })}
          />

          <SelectField
            label="Qual principal motivo do seu cadastro?"
            value={habilidades.motivo}
            onChange={(e) => setHabilidades({ ...habilidades, motivo: e.target.value })}
          >
            <option value="">Exemplos de dores - dropdown</option>
            {MOTIVOS_CADASTRO.map((motivo) => (
              <option key={motivo} value={motivo}>
                {motivo}
              </option>
            ))}
          </SelectField>

          <div className="flex items-center justify-between gap-3">
            <button onClick={handleBack} className={secondaryButtonClassName}>
              Voltar
            </button>
            <button onClick={handleCompleteProfile} className={primaryButtonClassName}>
              Concluir Cadastro
            </button>
          </div>
        </>
      )}
    </RegisterLayout>
  );
}
