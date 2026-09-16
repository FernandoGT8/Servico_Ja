import { useState, useRef, useEffect } from 'react'
import './RegisterClient.css'

export default function RegisterClient() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setShowAnimation(true)
  }, [currentStep])

  const handleContinue = () => {
    if (currentStep < 2) {
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

  return (
    <div className="admin-form-container">
      <div className={`admin-form-step ${showAnimation ? 'animate' : ''}`}>
        <div className="admin-form-header">
          <div className="header-content">
            <h1>Bem-vindo ao Serviço Já</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate ut laoreet velit ma.</p>
          </div>
        </div>

        <div className="admin-form-content">
          <div className="form-image-section">
            <div className="image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M4 20c0-2.667 3.582-4 8-4s8 1.333 8 4" />
              </svg>
            </div>
          </div>

          <div key={currentStep} className={`form-fields-section ${showAnimation ? 'animate' : ''}`}>
            {/* Step 1 */}
            {currentStep === 0 && (
              <>
                <div className="form-field">
                  <label>Qual principal segmento de atuação?</label>
                  <select className="form-select">
                    <option>Segmentos de Empresa</option>
                    <option>Construção Civil</option>
                    <option>Logística/CDs</option>
                    <option>Indústria & Manutenção</option>
                    <option>Facilities/Limpeza</option>
                    <option>TI/Operações Técnicas</option>
                    <option>Saúde & Bem-estar</option>
                    <option>Varejo & Comércio</option>
                    <option>Gastronomia & Hotelaria</option>
                    <option>Transporte & Frota</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Que tipo de profissional você busca?</label>
                  <select className="form-select">
                    <option>Tipos de profissional</option>
                    <option>Pedreiro / Alvenaria</option>
                    <option>Servente / Ajudante Geral de Obras</option>
                    <option>Carpinteiro / Armador</option>
                    <option>Encanador</option>
                    <option>Eletricista</option>
                    <option>Soldador</option>
                    <option>Pintor</option>
                    <option>Mecânico</option>
                  </select>
                </div>

                <button onClick={handleContinue} className="continue-button">Continuar</button>
              </>
            )}

            {/* Step 2 */}
            {currentStep === 1 && (
              <>
                <div className="form-field">
                  <label>Cargo</label>
                  <select className="form-select">
                    <option>Tipos de Cargos de Supervisão</option>
                    <option>Gerente</option>
                    <option>Supervisor</option>
                    <option>Coordenador</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Empresa</label>
                  <input type="text" className="form-input" placeholder="Nome da empresa" />
                </div>

                <div className="form-field">
                  <label>CNPJ</label>
                  <input type="text" className="form-input" placeholder="XX.XXX.XXX/XXXX-XX" />
                </div>

                <div className="form-field">
                  <label>Tamanho da Operação Atual</label>
                  <select className="form-select">
                    <option>Tamanho da Operação</option>
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-100</option>
                    <option>100+</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Já trabalha com Terceirizados?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input type="radio" name="terceirizados" value="sim" />
                      <span>Sim</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="terceirizados" value="nao" defaultChecked />
                      <span>Não</span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Qual principal motivo do seu cadastro?</label>
                  <select className="form-select">
                    <option>Motivo do cadastro</option>
                    <option>Reduzir custos</option>
                    <option>Aumentar produtividade</option>
                    <option>Melhorar qualidade</option>
                  </select>
                </div>

                <div className="form-buttons">
                  <button onClick={handleBack} className="back-button">Voltar</button>
                  <button onClick={handleContinue} className="continue-button">Continuar</button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {currentStep === 2 && (
              <>
                <div className="form-field">
                  <label>Nome</label>
                  <input type="text" className="form-input" placeholder="Digite seu nome e sobrenome" />
                </div>

                <div className="form-field">
                  <label>Telefone</label>
                  <input type="text" className="form-input" placeholder="(DDD) 99999-9999" />
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <input type="email" className="form-input" placeholder="Email corporativo" />
                </div>

                <div className="form-field">
                  <label>Crie sua senha</label>
                  <input type="password" className="form-input" placeholder="Digite sua senha" />
                  <small className="form-hint">Aviso de requisitos mínimos</small>
                </div>

                <div className="form-field">
                  <label>Repita a senha</label>
                  <input type="password" className="form-input" placeholder="Digite sua senha" />
                  <small className="form-hint">Aviso - as senhas devem coincidir</small>
                </div>

                <div className="form-buttons">
                  <button onClick={handleBack} className="back-button">Voltar</button>
                  <button className="continue-button">Enviar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
