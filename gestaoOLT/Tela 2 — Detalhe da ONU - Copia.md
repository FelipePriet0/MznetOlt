# Tela 2 — Detalhe da ONU 



##### 37\. Visualizar informações gerais da ONU


Exibe dados como:



1. OLT

    Mostra OLT que Conexão está situada 

    Ao clicar: Abre Mockup: "Mover ONU" 
   
2. Board / Quadro

   Mostra o Quadro cujo conexão está situada 

   Ao clicar: Abre Mockup: "Mover ONU"

   
3. Porta

   Mostra a porta/Bridge cujo conexão está situada

   Ao clicar: Abre Mockup: "Mover ONU"

   
4. ONU

   Mostra o N da ONU cujo conexão está situada

   Ao clicar: Abre Mockup: "Alterar ID ONU alocado"
   
5. Canal GPON

   Mostra se está em: GPON / XG-PON / XGS-PON

   Ao clicar: Abre Mockup: "Atualizar canal GPON
   
6. SN

   Mostra o Número de SN cujo conexão está situada

   Ao clicar: Abre Mockup: "Substitua ONU por SN"
   
7. Tipo de ONU

   Mostra o Número do tipo de ONU cujo conexão está situada

   Ao clicar: Abre Mockup: "Alterar tipo de ONU"

   
8. Zona

   Mostra a Zona cujo Conexão está Situada 

   Ao clicar: Abre Mockup: "Atualizar detalhes de localização"
   
9. Nome

   Mostra o Nome do Titular da Conexão cujo Conexão está Situada

   Ao clicar: Abre Mockup: "Atualizar detalhes de localização"

   
10. Endereço

    Mostra o Endereço da Conexão cujo Conexão está Situada

    Ao clicar: Abre Mockup: "Atualizar detalhes de localização"

    
11. Contato

    Mostra o Contato do Titular da Conexão cujo Conexão está Situada

    Ao clicar: Abre Mockup: "Atualizar detalhes de localização"
    
12. Data de autorização

    Mostra o Nome do Titular da Conexão cujo Conexão está Situada

    Ao clicar: Abre Mockup: "Histórico"
    
13. ID externo da ONU

    Mostra o ID Externo da ONU cujo Conexão está Situada

    Ao clicar: Abre Mockup: "Atualizar ID externo da ONU"
    
14. Visualizar status da ONU

    Exibe se a ONU está Online e há quanto tempo.Ex: Status On-line(Há 13 minutos))

    Ao clicar no Link, abre Mockup:
    
15. Visualizar sinal óptico

    Mostra potência óptica de recepção + distância estimada da ONU em metros (Exemplo: -23,46 dBm / -26,78 dBm (15743m)) 

    Ao clicar no Link, abre Mockup:

    
16. Visualizar VLAN configurada

    Mostra VLAN associada.

    Ao clicar abre Mockup: "Atualizar modo ONU"

    
17. Visualizar modo de operação da ONU

    Indica Bridge / VLAN principal. Mostra Ponte/Bridge + Vlan 

    Ao clicar abre Mockup: Atualizar modo ONU

    
18. Visualizar status TR069

    Mostra se TR069 está ativo ou inativo.

    Ao clicar abre Mockup: Gerenciamento de atualizações e VoIP IP
    
19. Visualizar status de gestão de IP

    Indica se gestão de IP está ativa.

    Ao clicar abre Mockup: Gerenciamento de atualizações e VoIP IP


    
20. **CTAs:**

    ---
21. Obter status atualizado da ONU

    Botão Obter status atualiza estado da ONU.

    
22. Exibir configuração em execução

    Botão Exibir configuração em execução mostra configuração ativa.

    Endpoint provável:

    GET /onu/get\_running\_config/{id}

    Retorna:

    interface gpon 0/4
    ont add 14 sn-auth ...
    service-port ...
    traffic-table ...

    Isso vem direto da OLT CLI.
    
23. Visualizar informações de software

    Botão Informações SW mostra dados de firmware.

    Endpoint provável:

    GET /onu/get\_software\_info/{id}

    Retorna:

    {
      "vendor": "ZTE",
      "model": "F6600",
      "firmware": "v2.1"
    }

    
24. Ver status em tempo real (CTA: AO VIVO)

    Indicador AO VIVO mostra status atual da ONU.

    Provavelmente inicia polling.

    Chama repetidamente:

    GET /signal/get\_signal\_graph\_series\_for\_onu/{id}
    GET /traffic/get\_daily\_for\_onu/{id}

    
25. Gráfico de tráfego

    Esse gráfico mostra:

    - upload
    - download

    Endpoint provável:

    GET /traffic/get\_daily\_for\_onu/{id}

    Retorno:
    \[
    { "time": "...", "upload": 0.01, "download": 0.00 }
    ]
    
26. Gráfico de sinal

    Endpoint provável:

    GET /signal/get\_signal\_graph\_series\_for\_onu/{id}

    Retorno:

    \[
    { "time": "...", "rx": -28.3 }
    ]

    
27. Configurar perfil de velocidade

    Tabela Horizontal com: 

    ID da porta de serviço | VLAN do Usuário | Download | Upload | Ação (Abaixo fica o CTA: configurar) 

    CTA configurar abre Mockup: "Configurar ID da porta de serviço "Aqui vai o mesmo ID que aparece na primeira coluna Tabela"

    Botão Configurar permite alterar perfil. 

    Isso vem de:

    GET /speed\_profiles
    
28. Portas Ethernet

    Tabela Horizontal com:

    Porta | Estado Admnistrativo da Porta | Modo Vlan da Porta | DHCP | Ação (Abaixo fica o CTA: configurar)

    CTA: Configurar abre mockup "Configurar porta ethernet "Aqui vai a mesma porta que aparece na Primeira Coluna da Tabela"" 

    
29. &nbsp;Visualizar suporte CATV

    Indica se ONU suporta CATV.
    
30. **CTAs:** 
    
    ---
31. Reinicio
    
32. Ressincronizar Configuração
    
33. Restaurar Padrões
    
34. Desativar ONU
    



