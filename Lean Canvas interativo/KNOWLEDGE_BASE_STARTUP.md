# 🧠 Base de Conhecimento: Análise de Viabilidade de Startups (Lean Canvas & Métricas)

Esta base de conhecimento orienta a análise diagnóstica de modelos de negócio em estágio inicial, focando em aprendizado validado e redução de risco sistêmico.

---

## 1. Fundamentos e Comparação de Modelos
A análise deve distinguir o **Lean Canvas (LC)** do **Business Model Canvas (BMC)** tradicional.

| Atributo | Business Model Canvas (BMC) | Lean Canvas (LC) |
| :--- | :--- | :--- |
| **Foco Principal** | Eficiência e infraestrutura. | Problemas, soluções e riscos. |
| **Público-Alvo** | Empresas consolidadas. | Startups em estágio inicial. |
| **Blocos Chave** | Parceiros e Atividades. | Problema, Solução e Vantagem Injusta. |
| **Incerteza** | Baixa (otimização). | Extrema (descoberta). |

---

## 2. Anatomia dos Blocos do Lean Canvas (Critérios de Validação)

### 2.1 Problema e Alternativas Existentes
* **Identificação:** Listar os 3 principais problemas.
* **Alternativas:** Como o cliente resolve a dor hoje (ex: planilhas, processos manuais).
* **Indicadores de Validação (IA deve pontuar):**
    * **Amplitude (Breadth):** Problema atinge $\geq$ 40% do público-alvo?
    * **Frequência:** Ocorre o suficiente para gerar receita?
    * **Intensidade (Pain Level):** O cliente gasta dinheiro/tempo hoje com alternativas?
    * **Contorno (Workaround):** Se o cliente criou uma solução "caseira", o PSF é iminente.

### 2.2 Segmentos de Clientes e Early Adopters
* **Foco:** Evitar generalismos. "Todo mundo" não é um segmento.
* **Early Adopters:** Perfil específico que sofre com o problema agora e aceita soluções imperfeitas.
* **Red Flag:** Descrições puramente demográficas sem psicografia ou comportamento de busca ativa.

### 2.3 Proposta de Valor Única (UVP) e Vantagem Injusta
* **UVP:** Deve passar no "Teste dos 5 Segundos". Incluir um **High-Level Concept** (ex: "O Uber para X").
* **Vantagem Injusta:** O "fosso defensivo" (Moat).
    * **Válido:** Dados proprietários, efeitos de rede, patentes, insider information.
    * **Inválido:** "Equipe qualificada", "preço baixo", "primeiro a chegar".

---

## 3. Métricas de Sucesso e Unit Economics

### 3.1 Framework AARRR (Pirate Metrics)
1.  **Aquisição:** Como o usuário chega (Métrica: CAC).
2.  **Ativação:** O "Aha! Moment" (Métrica: Taxa de Onboarding).
3.  **Retenção:** Uso contínuo (Métrica: Churn Rate). **Principal indicador de PMF.**
4.  **Referência:** Viralidade (Métrica: K-factor).
5.  **Receita:** Conversão financeira (Métrica: LTV, MRR).

### 3.2 Fórmulas Financeiras de Viabilidade
A IA deve aplicar os seguintes cálculos para validar a sustentabilidade:

**Custo de Aquisição de Cliente (CAC):**
$$CAC = \frac{\text{Total de Gastos (Mkt + Vendas)}}{\text{Novos Clientes}}$$

**Customer Lifetime Value (LTV):**
$$LTV = \frac{\text{Margem de Contribuição Média por Cliente}}{\text{Taxa de Churn}}$$

**Payback Period:**
$$\text{Payback} = \frac{CAC}{\text{Receita Mensal Líquida por Cliente}}$$

### 3.3 Benchmarks de Viabilidade
| Métrica | Benchmark SaaS B2B | Benchmark SaaS B2C |
| :--- | :--- | :--- |
| **LTV / CAC** | $> 3.0x$ | $> 2.5x$ |
| **Payback** | $< 12$ meses | $< 6$ meses |
| **Churn Rate** | $< 5\%$ anual | $< 10\%$ mensal |

---

## 4. Ontologia da Validação: PSF vs PMF

* **Problem-Solution Fit (PSF):** Foco qualitativo. O problema é real? A solução resolve?
    * *Sinal de sucesso:* Disposição para pagar por um MVP rudimentar.
* **Product-Market Fit (PMF):** Foco quantitativo. O mercado é grande e retém usuários?
    * **Teste de Sean Ellis:** $\geq$ 40% dos usuários ficariam "muito desapontados" sem o produto.

---

## 5. Heurísticas de Análise para a IA (Protocolo de Diagnóstico)

Para cada Lean Canvas preenchido, a IA deve executar estes testes de estresse:

1.  **Teste de Especificidade:** "Este texto poderia ser usado por um concorrente de outro setor?" (Se sim, é genérico).
2.  **Consistência Segmento-Canal:** O canal escolhido é frequentado pelo Early Adopter?
3.  **Consistência Receita-Custo:** O LTV projetado cobre o CAC do canal escolhido?
4.  **Teste da Vantagem Injusta:** A vantagem pode ser comprada com dinheiro? (Se sim, não é uma vantagem injusta).

---

---

## 7. Diretrizes de Comunicação e Tom de Voz (Arquétipo Mentor)

Para garantir que a análise seja útil para empreendedores iniciantes, a IA deve seguir este padrão:

1.  **Linguagem Acessível:** Priorizar descrições em português seguidas pelo termo técnico em inglês entre parênteses.
    *   *Exemplo:* "A sua taxa de cancelamento de clientes (Churn Rate) está alta."
2.  **Analogias Didáticas:** Ao explicar conceitos complexos (como Unit Economics), usar analogias do cotidiano ou de pequenos negócios tradicionais.
3.  **Sugestões Acionáveis:** Em vez de dar conselhos teóricos, focar em "o que fazer amanhã" (Next Steps práticos).
4.  **Foco no Aprendizado:** A análise deve ser rigorosa (crítica), mas o texto deve ser encorajador e educativo, explicando o *porquê* de cada diagnóstico.
