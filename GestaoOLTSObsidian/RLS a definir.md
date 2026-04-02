Legenda: 

👁️ -> Apenas visualiza
✅ -> Pode (Criar / Editar / Deletar / Desativar)
❌ -> Não vê nem edita 

# RLS a definir

Preencha as tabelas abaixo marcando cada célula com: Olho / Check / X.

## Dashboard
| Feature                             | Leitor | Técnico | Admin |
| ----------------------------------- | ------ | ------- | ----- |
| Ver cards do dashboard              | 👁️    | ✅       | ✅     |
| Ver gráfico de estado da rede       | 👁️    | ✅       | ✅     |
| Filtrar dashboard por OLT           | 👁️    | ✅       | ✅     |
| Ver gráfico de autorizações por dia | 👁️    | 👁️     | ✅     |

## ONUs
| Feature                              | Leitor | Técnico | Admin |
| ------------------------------------ | ------ | ------- | ----- |
| Ver Lista de ONUs configuradas       | 👁️    | ✅       | ✅     |
| Utilizar Filtros de ONU configuradas | 👁️    | ✅       | ✅     |
| Exportar ONUs                        | 👁️    | ❌       | ✅     |
| Autorizar ONU (ABA: Unconfigured)    | 👁️    | ✅       | ✅     |

## Detalhes da ONU

| Feature                                                                                    | Leitor | Técnico | Admin |
| ------------------------------------------------------------------------------------------ | ------ | ------- | ----- |
| Editar informações nas Inlines (OLT / Board / Port / Etc)                                  | 👁️    | ✅       | ✅     |
| Utilizar CTAs (Obter Status / Exibir Configurações em execução / Informações SW / Ao vivo) | 👁️    | ✅       | ✅     |
| Reiniciar                                                                                  | 👁️    | ✅       | ✅     |
| ressync                                                                                    | 👁️    | ✅       | ✅     |
| desativar ONU                                                                              | 👁️    | ✅       | ✅     |

## OLTs

| Feature                                  | Leitor | Técnico | Admin |
| ---------------------------------------- | ------ | ------- | ----- |
| Ver lista de OLTs                        | ❌      | ❌       | ✅     |
| Criar OLT                                | ❌      | ❌       | ✅     |
| Editar OLT                               | ❌      | ❌       | ✅     |
| Detalhes da OLT  (Todas Features da aba) | ❌      | ❌       | ✅     |
| Cartões OLT  (Todas Features da aba)     | ❌      | ❌       | ✅     |
| Portas PON (Todas Features da aba)       | ❌      | ❌       | ✅     |
| Executar scan de ONUs na OLT             | ❌      | ❌       | ✅     |
| Uplinks (Todas Features da aba)          | ❌      | ❌       | ✅     |
| Gerenciar VLANs (Todas Features da aba)  | ❌      | ❌       | ✅     |
| Editar avançado                          | ❌      | ❌       | ✅     |

## Zones

| Feature                   | Leitor | Técnico | Admin |
| ------------------------- | ------ | ------- | ----- |
| Ver zonas                 | ❌      | ❌       | ✅     |
| Criar/editar/excluir zona | ❌      | ❌       | ✅     |