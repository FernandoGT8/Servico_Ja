import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { getHomeRoute } from "@/utils/roleRoutes";
import { RegisterLayout, TextField, SelectField, SimNaoField } from "./RegisterFields";
import { primaryButtonClassName, secondaryButtonClassName } from "./registerFieldsUtils";

const SEGMENTOS = [
  "Construção Civil",
  "Logística/CDs",
  "Indústria & Manutenção",
  "Facilities/Limpeza",
  "TI/Operações Técnicas",
  "Saúde & Bem-estar",
  "Varejo & Comércio",
  "Gastronomia & Hotelaria",
  "Transporte & Frota",
];

const TIPOS_PROFISSIONAL = [
  "Pedreiro / Alvenaria",
  "Servente / Ajudante Geral de Obras",
  "Carpinteiro / Armador",
  "Encanador",
  "Eletricista",
  "Soldador",
  "Pintor",
  "Mecânico",
];

const CARGOS = ["Gerente", "Supervisor", "Coordenador"];

const TAMANHOS_OPERACAO = ["1-10", "11-50", "51-100", "100+"];

const MOTIVOS_CADASTRO = ["Reduzir custos", "Aumentar produtividade", "Melhorar qualidade"];

// Segunda etapa do cadastro do Cliente — conta já existe (criada em
// FirstRegisterClient, /register/client). Aqui só completa o perfil
// (segmento, cargo, empresa, CNPJ); depois disso o cadastro segue Pendente
// até a validação de CNPJ e liberação pelo ADMIN/ANALISTA (PRD §3.5).
export default function RegisterClient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [dadosGerais, setDadosGerais] = useState({
    segmento: "",
    tipoProfissional: "",
  });

  const [empresa, setEmpresa] = useState({
    cargo: "",
    nomeEmpresa: "",
    cnpj: "",
    tamanhoOperacao: "",
    jaTrabalhaTerceirizados: "não",
    motivoCadastro: "",
  });

  function handleContinue() {
    if (currentStep < 1) {
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
    // TODO: endpoint de completar perfil do Cliente ainda não existe no
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
          <SelectField
            label="Qual principal segmento de atuação?"
            value={dadosGerais.segmento}
            onChange={(e) => setDadosGerais({ ...dadosGerais, segmento: e.target.value })}
          >
            <option value="">Segmentos de Empresa</option>
            {SEGMENTOS.map((segmento) => (
              <option key={segmento} value={segmento}>
                {segmento}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Que tipo de profissional você busca?"
            value={dadosGerais.tipoProfissional}
            onChange={(e) =>
              setDadosGerais({ ...dadosGerais, tipoProfissional: e.target.value })
            }
          >
            <option value="">Tipos de profissional</option>
            {TIPOS_PROFISSIONAL.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </SelectField>

          <button onClick={handleContinue} className={`${primaryButtonClassName} self-start`}>
            Continuar
          </button>
        </>
      )}

      {currentStep === 1 && (
        <>
          <SelectField
            label="Cargo"
            value={empresa.cargo}
            onChange={(e) => setEmpresa({ ...empresa, cargo: e.target.value })}
          >
            <option value="">Tipos de Cargos de Supervisão</option>
            {CARGOS.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Empresa"
            placeholder="Nome da empresa"
            value={empresa.nomeEmpresa}
            onChange={(e) => setEmpresa({ ...empresa, nomeEmpresa: e.target.value })}
          />

          <TextField
            label="CNPJ"
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={empresa.cnpj}
            onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
          />

          <SelectField
            label="Tamanho da Operação Atual"
            value={empresa.tamanhoOperacao}
            onChange={(e) => setEmpresa({ ...empresa, tamanhoOperacao: e.target.value })}
          >
            <option value="">Tamanho da Operação</option>
            {TAMANHOS_OPERACAO.map((tamanho) => (
              <option key={tamanho} value={tamanho}>
                {tamanho}
              </option>
            ))}
          </SelectField>

          <SimNaoField
            label="Já trabalha com Terceirizados?"
            name="jaTrabalhaTerceirizados"
            value={empresa.jaTrabalhaTerceirizados}
            onChange={(value) => setEmpresa({ ...empresa, jaTrabalhaTerceirizados: value })}
          />

          <SelectField
            label="Qual principal motivo do seu cadastro?"
            value={empresa.motivoCadastro}
            onChange={(e) => setEmpresa({ ...empresa, motivoCadastro: e.target.value })}
          >
            <option value="">Motivo do cadastro</option>
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
