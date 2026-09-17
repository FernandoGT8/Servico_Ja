import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { register } from "@/services/authService";
import { FirstRegisterLayout, TextField, PasswordField, CheckboxField } from "./FirstRegisterFields";
import { primaryButtonClassName, secondaryButtonClassName } from "./firstRegisterFieldsUtils";

// Primeira etapa do cadastro do Prestador: só cria a conta (login).
// O resto do perfil (CPF, CNPJ/MEI, habilidades...) é preenchido depois,
// já autenticado, em /register/provider/complete (pages/Register/RegisterProvider.jsx).
export default function FirstRegisterProvider() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    senha: "",
    senhaConfirm: "",
    aceitouTermos: false,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.aceitouTermos) {
      setError("É preciso aceitar os termos de uso e a política de privacidade");
      return;
    }

    if (formData.senha !== formData.senhaConfirm) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
        senhaConfirm: formData.senhaConfirm,
        tipo: "PRESTADOR",
      };

      const data = await register(payload);
      login(data);
      setLoading(false);
      navigate("/register/provider/complete");
    } catch (err) {
      setError(err.message || "Erro ao conectar com o servidor. Tente novamente.");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      <FirstRegisterLayout
        title="Bem-vindo ao Serviço Já"
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulputate ut laoreet velit ma."
        onSubmit={handleSubmit}
      >
        <TextField
          label="Nome"
          placeholder="Digite seu nome e sobrenome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />

        <TextField
          label="Telefone"
          placeholder="(DDD) 99999-9999"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
        />

        <TextField
          label="Email"
          type="email"
          placeholder="Email corporativo"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <PasswordField
          label="Crie sua senha"
          placeholder="Digite sua senha"
          hint="Aviso de requisitos mínimos!"
          value={formData.senha}
          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
        />

        <PasswordField
          label="Repita a senha"
          placeholder="Digite sua senha"
          hint="Aviso - as senhas devem coincidir"
          value={formData.senhaConfirm}
          onChange={(e) => setFormData({ ...formData, senhaConfirm: e.target.value })}
        />

        <CheckboxField
          label="Eu aceito os termos de uso do aplicativo e estou de acordo com a política de privacidade."
          checked={formData.aceitouTermos}
          onChange={(e) => setFormData({ ...formData, aceitouTermos: e.target.checked })}
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`${secondaryButtonClassName} sm:w-28`}
            disabled={loading}
          >
            Voltar
          </button>
          <button
            type="submit"
            className={`${primaryButtonClassName} sm:w-72`}
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>
      </FirstRegisterLayout>

      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border-l-4 border-red-600 bg-red-100 px-6 py-4 text-sm font-medium text-red-900 shadow-lg">
          {error}
        </div>
      )}
    </>
  );
}
