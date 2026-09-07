import { useState } from 'react'
import './SignUp.css'

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0)

  // Formulário - Etapa 1
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    estado: '',
    cidade: '',
  })

  // Formulário - Etapa 2
  const [etapa2Data, setEtapa2Data] = useState({
    meiCnpj: '',
    cnpj: '',
    clt: 'não',
    disponibilidade: '',
  })

  // Formulário - Etapa 3
  const [etapa3Data, setEtapa3Data] = useState({
    areaAtuacao: [],
    experiencia: '',
    nivelConhecimento: 'profissional',
    terceirizado: 'não',
    motivo: '',
  })

  // Formulário - Etapa 4
  const [etapa4Data, setEtapa4Data] = useState({
    senha: '',
    senhaConfirm: '',
  })

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCreateAccount = (e) => {
    e.preventDefault()
    // TODO: Integrar com backend
    console.log('Conta criada:', { formData, etapa2Data, etapa3Data, etapa4Data })
  }

  const handleAreaToggle = (area) => {
    setEtapa3Data(prev => {
      const areas = prev.areaAtuacao.includes(area)
        ? prev.areaAtuacao.filter(a => a !== area)
        : [...prev.areaAtuacao, area].slice(0, 5)
      return { ...prev, areaAtuacao: areas }
    })
  }

  return (
    <div className="signup-container">
      <div className="signup-step">
        <div className="signup-header">
          <div className="header-content">
            <h1>Bem-vindo ao Serviço Já</h1>
            <p>Complete seu cadastro em poucas etapas</p>
          </div>
        </div>

        <div className="signup-content">
          <div className="signup-image-section">
            <div className="image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M4 20c0-2.667 3.582-4 8-4s8 1.333 8 4" />
              </svg>
            </div>
          </div>

          <div key={currentStep} className="signup-fields-section">
            {/* Etapa 1: Dados Básicos */}
            {currentStep === 0 && (
              <>
                <div className="form-field">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Digite seu nome e sobrenome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Seu CPF</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123.456.789-11"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Seu telefone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(DDD) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Seu e-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="MeuEmail@gmail.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Estado onde mora</label>
                  <select
                    className="form-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option>Lista de estados - dropdown</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                    <option>Minas Gerais</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Cidade onde mora</label>
                  <select
                    className="form-select"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  >
                    <option>Lista de cidades - dropdown</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Eu aceito os termos de uso do aplicativo e estou de acordo com a política de privacidade.</span>
                  </label>
                </div>

                <div className="form-buttons">
                  <button onClick={handleContinue} className="continue-button">Avançar</button>
                </div>
              </>
            )}

            {/* Etapa 2: MEI/CNPJ e Disponibilidade */}
            {currentStep === 1 && (
              <>
                <div className="form-field">
                  <label>Você já tem MEI ou CNPJ?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="meiCnpj"
                        value="sim"
                        checked={etapa2Data.meiCnpj === 'sim'}
                        onChange={(e) => setEtapa2Data({ ...etapa2Data, meiCnpj: e.target.value })}
                      />
                      <span>Sim, já tenho MEI</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="meiCnpj"
                        value="nao-mas"
                        checked={etapa2Data.meiCnpj === 'nao-mas'}
                        onChange={(e) => setEtapa2Data({ ...etapa2Data, meiCnpj: e.target.value })}
                      />
                      <span>Não, mas gostaria de ter</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="meiCnpj"
                        value="nao"
                        checked={etapa2Data.meiCnpj === 'nao'}
                        onChange={(e) => setEtapa2Data({ ...etapa2Data, meiCnpj: e.target.value })}
                      />
                      <span>Não tenho interesse em ter</span>
                    </label>
                  </div>
                </div>

                {etapa2Data.meiCnpj === 'sim' && (
                  <div className="form-field">
                    <label>Se sim, insira o CNPJ</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      value={etapa2Data.cnpj}
                      onChange={(e) => setEtapa2Data({ ...etapa2Data, cnpj: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>Você está trabalhando CLT atualmente?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="clt"
                        value="sim"
                        checked={etapa2Data.clt === 'sim'}
                        onChange={(e) => setEtapa2Data({ ...etapa2Data, clt: e.target.value })}
                      />
                      <span>Sim</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="clt"
                        value="não"
                        checked={etapa2Data.clt === 'não'}
                        onChange={(e) => setEtapa2Data({ ...etapa2Data, clt: e.target.value })}
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Você tem disponibilidade para atuar em quais dias?</label>
                  <select
                    className="form-select"
                    value={etapa2Data.disponibilidade}
                    onChange={(e) => setEtapa2Data({ ...etapa2Data, disponibilidade: e.target.value })}
                  >
                    <option>Disponibilidade - dropdown</option>
                    <option>Segunda a Sexta</option>
                    <option>Feriados</option>
                    <option>Fins de semana</option>
                    <option>24/7</option>
                  </select>
                </div>

                <div className="form-buttons">
                  <button onClick={handleBack} className="back-button">Voltar</button>
                  <button onClick={handleContinue} className="continue-button">Avançar</button>
                </div>
              </>
            )}

            {/* Etapa 3: Experiência e Especialidade */}
            {currentStep === 2 && (
              <>
                <div className="form-field">
                  <label>Qual sua área de atuação? (escolha até 5)</label>
                  <div className="checkbox-group">
                    {['Construção Civil', 'Logística', 'Indústria', 'Facilities', 'TI', 'Saúde', 'Varejo', 'Gastronomia'].map(area => (
                      <label key={area} className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={etapa3Data.areaAtuacao.includes(area)}
                          onChange={() => handleAreaToggle(area)}
                          disabled={etapa3Data.areaAtuacao.length >= 5 && !etapa3Data.areaAtuacao.includes(area)}
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label>Quanto tempo de experiência?</label>
                  <select
                    className="form-select"
                    value={etapa3Data.experiencia}
                    onChange={(e) => setEtapa3Data({ ...etapa3Data, experiencia: e.target.value })}
                  >
                    <option>Faixa de tempo - dropdown</option>
                    <option>Menos de 1 ano</option>
                    <option>1-3 anos</option>
                    <option>3-5 anos</option>
                    <option>Mais de 5 anos</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Nível de conhecimento na área</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="nivel"
                        value="aprendiz"
                        checked={etapa3Data.nivelConhecimento === 'aprendiz'}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, nivelConhecimento: e.target.value })}
                      />
                      <span>Aprendiz</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="nivel"
                        value="profissional"
                        checked={etapa3Data.nivelConhecimento === 'profissional'}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, nivelConhecimento: e.target.value })}
                      />
                      <span>Profissional</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="nivel"
                        value="especialista"
                        checked={etapa3Data.nivelConhecimento === 'especialista'}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, nivelConhecimento: e.target.value })}
                      />
                      <span>Especialista</span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Já trabalhou como Terceirizado?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="terceirizado"
                        value="sim"
                        checked={etapa3Data.terceirizado === 'sim'}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, terceirizado: e.target.value })}
                      />
                      <span>Sim</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="terceirizado"
                        value="não"
                        checked={etapa3Data.terceirizado === 'não'}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, terceirizado: e.target.value })}
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Qual principal motivo do seu cadastro?</label>
                  <select
                    className="form-select"
                    value={etapa3Data.motivo}
                    onChange={(e) => setEtapa3Data({ ...etapa3Data, motivo: e.target.value })}
                  >
                    <option>Exemplos de dores - dropdown</option>
                    <option>Aumentar renda</option>
                    <option>Reduzir custos</option>
                    <option>Expandir negócio</option>
                  </select>
                </div>

                <div className="form-buttons">
                  <button onClick={handleBack} className="back-button">Voltar</button>
                  <button onClick={handleContinue} className="continue-button">Avançar</button>
                </div>
              </>
            )}

            {/* Etapa 4: Criar Senha */}
            {currentStep === 3 && (
              <>
                <div className="form-field">
                  <label>Crie sua senha</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Digite sua senha"
                    value={etapa4Data.senha}
                    onChange={(e) => setEtapa4Data({ ...etapa4Data, senha: e.target.value })}
                  />
                  <small className="form-hint">Aviso de requisitos mínimos</small>
                </div>

                <div className="form-field">
                  <label>Repita a senha</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Digite sua senha"
                    value={etapa4Data.senhaConfirm}
                    onChange={(e) => setEtapa4Data({ ...etapa4Data, senhaConfirm: e.target.value })}
                  />
                  <small className="form-hint">Aviso - as senhas devem coincidir</small>
                </div>

                <div className="form-buttons">
                  <button onClick={handleBack} className="back-button">Voltar</button>
                  <button onClick={handleCreateAccount} className="continue-button">Criar conta</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
