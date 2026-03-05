// app.js — NSE Analytics Dashboard
// All data inlined from dashboard_data.json

const DATA = {"daily":[{"date":"2025-09-09","day":"Tuesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":11193.5,"sf_turnover":53157.75,"io_notional":50784001.32,"io_premium":51744.35,"so_notional":315830.62,"so_premium":4961.59,"io_pcr":1,"total_contracts":277576396,"total_turnover":51164183.19,"if_rev":0.3873,"sf_rev":1.8393,"fut_rev":2.2266,"io_rev":36.2521,"so_rev":3.4761,"opt_rev":39.7282,"fo_rev":41.9547,"pn_ratio":0.001109708933418461,"vix":10.685,"cash_traded_value":79908.68,"cash_rev":4.7466,"total_rev":46.7013},{"date":"2025-09-10","day":"Wednesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":20745.55,"sf_turnover":75185.71,"io_notional":10227481.46,"io_premium":32437.71,"so_notional":426706.67,"so_premium":6839.12,"io_pcr":0.87,"total_contracts":61573730,"total_turnover":10750119.39,"if_rev":0.7178,"sf_rev":2.6014,"fut_rev":3.3192,"io_rev":22.7259,"so_rev":4.7915,"opt_rev":27.5173,"fo_rev":30.8366,"pn_ratio":0.003686515529926164,"vix":10.5375,"cash_traded_value":102041.4,"cash_rev":6.0613,"total_rev":36.8979},{"date":"2025-09-11","day":"Thursday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":10192.35,"sf_turnover":68756.17,"io_notional":8234676.07,"io_premium":21548.74,"so_notional":412991.67,"so_premium":6673.39,"io_pcr":0.94,"total_contracts":50692822,"total_turnover":8726616.26,"if_rev":0.3527,"sf_rev":2.379,"fut_rev":2.7316,"io_rev":15.097,"so_rev":4.6754,"opt_rev":19.7724,"fo_rev":22.504,"pn_ratio":0.0032635539255813266,"vix":10.36,"cash_traded_value":96204.83,"cash_rev":5.7146,"total_rev":28.2186},{"date":"2025-09-12","day":"Friday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":12898.75,"sf_turnover":66236.9,"io_notional":13075117.72,"io_premium":29013.7,"so_notional":438820.96,"so_premium":6602.7,"io_pcr":0.93,"total_contracts":76544166,"total_turnover":13593074.33,"if_rev":0.4463,"sf_rev":2.2918,"fut_rev":2.7381,"io_rev":20.327,"so_rev":4.6259,"opt_rev":24.9528,"fo_rev":27.6909,"pn_ratio":0.002635530680090373,"vix":10.1225,"cash_traded_value":92241.52,"cash_rev":5.4791,"total_rev":33.17},{"date":"2025-09-15","day":"Monday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":10608.99,"sf_turnover":58758.88,"io_notional":17646826.4,"io_premium":29454.5,"so_notional":395975.74,"so_premium":5812.7,"io_pcr":0.99,"total_contracts":100236348,"total_turnover":18112170.01,"if_rev":0.3671,"sf_rev":2.0331,"fut_rev":2.4001,"io_rev":20.6358,"so_rev":4.0724,"opt_rev":24.7082,"fo_rev":27.1083,"pn_ratio":0.0019546409546782294,"vix":10.3975,"cash_traded_value":85104.65,"cash_rev":5.0552,"total_rev":32.1635},{"date":"2025-09-16","day":"Tuesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":18314.41,"sf_turnover":66589.64,"io_notional":46616397.84,"io_premium":44205.76,"so_notional":431184.61,"so_premium":5711.27,"io_pcr":0.92,"total_contracts":253985719,"total_turnover":47132486.5,"if_rev":0.6337,"sf_rev":2.304,"fut_rev":2.9377,"io_rev":30.9706,"so_rev":4.0013,"opt_rev":34.9719,"fo_rev":37.9096,"pn_ratio":0.0010609903293766372,"vix":10.2725,"cash_traded_value":91048.46,"cash_rev":5.4083,"total_rev":43.3179},{"date":"2025-09-17","day":"Wednesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":17099.06,"sf_turnover":80924.59,"io_notional":8670482.02,"io_premium":26040.2,"so_notional":575660.95,"so_premium":7613.12,"io_pcr":0.9,"total_contracts":54704367,"total_turnover":9344166.62,"if_rev":0.5916,"sf_rev":2.8,"fut_rev":3.3916,"io_rev":18.2438,"so_rev":5.3338,"opt_rev":23.5775,"fo_rev":26.9691,"pn_ratio":0.0036397144311083483,"vix":10.2475,"cash_traded_value":101041.26,"cash_rev":6.0019,"total_rev":32.971},{"date":"2025-09-18","day":"Thursday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":20733.51,"sf_turnover":84459.41,"io_notional":10859178.15,"io_premium":26029.5,"so_notional":514491.39,"so_premium":6593.49,"io_pcr":1.07,"total_contracts":65242976,"total_turnover":11478862.46,"if_rev":0.7174,"sf_rev":2.9223,"fut_rev":3.6397,"io_rev":18.2363,"so_rev":4.6194,"opt_rev":22.8557,"fo_rev":26.4953,"pn_ratio":0.0028682906501959083,"vix":9.885,"cash_traded_value":97994.78,"cash_rev":5.8209,"total_rev":32.3162},{"date":"2025-09-19","day":"Friday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":20260.82,"sf_turnover":102880.33,"io_notional":18138647.36,"io_premium":37471.99,"so_notional":576864.25,"so_premium":7732.59,"io_pcr":1.12,"total_contracts":104585748,"total_turnover":18838652.76,"if_rev":0.701,"sf_rev":3.5597,"fut_rev":4.2607,"io_rev":26.2529,"so_rev":5.4175,"opt_rev":31.6703,"fo_rev":35.931,"pn_ratio":0.0024153536885332307,"vix":9.9675,"cash_traded_value":138903.11,"cash_rev":8.2508,"total_rev":44.1818},{"date":"2025-09-22","day":"Monday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":18493.49,"sf_turnover":110169.16,"io_notional":25253414.44,"io_premium":40277.45,"so_notional":653175.81,"so_premium":8385.25,"io_pcr":1.02,"total_contracts":143594948,"total_turnover":26035252.9,"if_rev":0.6399,"sf_rev":3.8119,"fut_rev":4.4517,"io_rev":28.2184,"so_rev":5.8747,"opt_rev":34.0931,"fo_rev":38.5448,"pn_ratio":0.0018783907696999992,"vix":10.5575,"cash_traded_value":103101.44,"cash_rev":6.1242,"total_rev":44.669},{"date":"2025-09-23","day":"Tuesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":21474.79,"sf_turnover":106466.25,"io_notional":61875211.51,"io_premium":61870.96,"so_notional":661408.14,"so_premium":7445.56,"io_pcr":0.97,"total_contracts":337481452,"total_turnover":62664560.69,"if_rev":0.743,"sf_rev":3.6837,"fut_rev":4.4268,"io_rev":43.3468,"so_rev":5.2164,"opt_rev":48.5632,"fo_rev":52.9899,"pn_ratio":0.0011084148837584317,"vix":10.625,"cash_traded_value":105317.21,"cash_rev":6.2558,"total_rev":59.2457},{"date":"2025-09-24","day":"Wednesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":26547.27,"sf_turnover":123425.93,"io_notional":11849785.55,"io_premium":33996.05,"so_notional":643423.71,"so_premium":6354.1,"io_pcr":1.02,"total_contracts":73248792,"total_turnover":12643182.46,"if_rev":0.9185,"sf_rev":4.2705,"fut_rev":5.1891,"io_rev":23.8176,"so_rev":4.4517,"opt_rev":28.2693,"fo_rev":33.4584,"pn_ratio":0.0032297666004195303,"vix":10.5225,"cash_traded_value":94297.85,"cash_rev":5.6013,"total_rev":39.0597},{"date":"2025-09-25","day":"Thursday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":33792.4,"sf_turnover":312387.81,"io_notional":12354842.98,"io_premium":31493.13,"so_notional":654255.01,"so_premium":5769.63,"io_pcr":0.95,"total_contracts":79122267,"total_turnover":13355278.2,"if_rev":1.1692,"sf_rev":10.8086,"fut_rev":11.9778,"io_rev":22.0641,"so_rev":4.0422,"opt_rev":26.1063,"fo_rev":38.0841,"pn_ratio":0.002864361543639968,"vix":10.7825,"cash_traded_value":100235.74,"cash_rev":5.954,"total_rev":44.0381},{"date":"2025-09-26","day":"Friday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":48171.2,"sf_turnover":303374.01,"io_notional":22552340.66,"io_premium":52662.69,"so_notional":793678.88,"so_premium":6951.72,"io_pcr":1.1,"total_contracts":136308857,"total_turnover":23697564.75,"if_rev":1.6667,"sf_rev":10.4967,"fut_rev":12.1635,"io_rev":36.8955,"so_rev":4.8704,"opt_rev":41.7659,"fo_rev":53.9293,"pn_ratio":0.0025535149534960085,"vix":11.425,"cash_traded_value":97349.73,"cash_rev":5.7826,"total_rev":59.7119},{"date":"2025-09-29","day":"Monday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":52208.54,"sf_turnover":307234.5,"io_notional":34036998.92,"io_premium":62527.22,"so_notional":625314.57,"so_premium":5601.5,"io_pcr":1.1,"total_contracts":196133595,"total_turnover":35021756.53,"if_rev":1.8064,"sf_rev":10.6303,"fut_rev":12.4367,"io_rev":43.8066,"so_rev":3.9244,"opt_rev":47.731,"fo_rev":60.1677,"pn_ratio":0.001965498350814206,"vix":11.365,"cash_traded_value":133255.38,"cash_rev":7.9154,"total_rev":68.0831},{"date":"2025-09-30","day":"Tuesday","fy_quarter":"Q2 FY 2026","fy_month":"FY 2026 September","fy":"FY 2026","if_turnover":40989.55,"sf_turnover":203765.89,"io_notional":65014432.94,"io_premium":68712.45,"so_notional":398731.14,"so_premium":5225.49,"io_pcr":1.06,"total_contracts":358422888,"total_turnover":65657919.52,"if_rev":1.4182,"sf_rev":7.0503,"fut_rev":8.4685,"io_rev":48.1399,"so_rev":3.661,"opt_rev":51.8009,"fo_rev":60.2695,"pn_ratio":0.0011303220237072501,"vix":11.065,"cash_traded_value":102544.59,"cash_rev":6.0911,"total_rev":66.3606},{"date":"2025-10-01","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":26068.92,"sf_turnover":79103.72,"io_notional":11914301.7,"io_premium":35689.73,"so_notional":353845.02,"so_premium":6473.9,"io_pcr":0.9,"total_contracts":70172593,"total_turnover":12373319.36,"if_rev":0.902,"sf_rev":2.737,"fut_rev":3.639,"io_rev":25.0042,"so_rev":4.5356,"opt_rev":29.5398,"fo_rev":33.1788,"pn_ratio":0.0034368377687612143,"vix":10.2875,"cash_traded_value":99744.74,"cash_rev":5.9248,"total_rev":39.1036},{"date":"2025-10-03","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":16836.95,"sf_turnover":75227.78,"io_notional":19031853.09,"io_premium":42413.88,"so_notional":350497.1,"so_premium":6214.77,"io_pcr":0.92,"total_contracts":107886965,"total_turnover":19474414.92,"if_rev":0.5826,"sf_rev":2.6029,"fut_rev":3.1854,"io_rev":29.7152,"so_rev":4.3541,"opt_rev":34.0692,"fo_rev":37.2547,"pn_ratio":0.002508914013177263,"vix":10.06,"cash_traded_value":112827.66,"cash_rev":6.702,"total_rev":43.9567},{"date":"2025-10-06","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":21030.83,"sf_turnover":79251.17,"io_notional":27951998.22,"io_premium":45167.16,"so_notional":382056.27,"so_premium":6868,"io_pcr":0.88,"total_contracts":155541736,"total_turnover":28434336.49,"if_rev":0.7277,"sf_rev":2.7421,"fut_rev":3.4698,"io_rev":31.6441,"so_rev":4.8117,"opt_rev":36.4558,"fo_rev":39.9256,"pn_ratio":0.0018364883154426378,"vix":10.1925,"cash_traded_value":96871.84,"cash_rev":5.7542,"total_rev":45.6798},{"date":"2025-10-07","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":19779.02,"sf_turnover":76118.83,"io_notional":65767988.08,"io_premium":64278.42,"so_notional":381487.18,"so_premium":6829.57,"io_pcr":0.97,"total_contracts":354936240,"total_turnover":66245373.11,"if_rev":0.6844,"sf_rev":2.6337,"fut_rev":3.3181,"io_rev":45.0335,"so_rev":4.7848,"opt_rev":49.8183,"fo_rev":53.1363,"pn_ratio":0.0010749592452624997,"vix":10.05,"cash_traded_value":98573.03,"cash_rev":5.8552,"total_rev":58.9915},{"date":"2025-10-08","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":22073.62,"sf_turnover":73070.12,"io_notional":15264626.67,"io_premium":42524.69,"so_notional":391101.12,"so_premium":6369.95,"io_pcr":0.99,"total_contracts":87414902,"total_turnover":15750871.53,"if_rev":0.7637,"sf_rev":2.5282,"fut_rev":3.292,"io_rev":29.7928,"so_rev":4.4628,"opt_rev":34.2556,"fo_rev":37.5476,"pn_ratio":0.003123115108786648,"vix":10.3125,"cash_traded_value":89602.56,"cash_rev":5.3224,"total_rev":42.87},{"date":"2025-10-09","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":18705.89,"sf_turnover":74137.6,"io_notional":13263899.97,"io_premium":33710.44,"so_notional":409338,"so_premium":6794.1,"io_pcr":0.89,"total_contracts":77061440,"total_turnover":13766081.46,"if_rev":0.6472,"sf_rev":2.5652,"fut_rev":3.2124,"io_rev":23.6175,"so_rev":4.7599,"opt_rev":28.3775,"fo_rev":31.5899,"pn_ratio":0.002962322464427934,"vix":10.12,"cash_traded_value":92463.58,"cash_rev":5.4923,"total_rev":37.0822},{"date":"2025-10-10","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":19622.77,"sf_turnover":83298.51,"io_notional":19353589.24,"io_premium":44914.96,"so_notional":473292.54,"so_premium":7383.59,"io_pcr":0.93,"total_contracts":110074755,"total_turnover":19929803.06,"if_rev":0.6789,"sf_rev":2.8821,"fut_rev":3.5611,"io_rev":31.4674,"so_rev":5.1729,"opt_rev":36.6404,"fo_rev":40.2014,"pn_ratio":0.0026377597133178656,"vix":10.1025,"cash_traded_value":94005.11,"cash_rev":5.5839,"total_rev":45.7853},{"date":"2025-10-13","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":20366.25,"sf_turnover":69558.85,"io_notional":26303654.87,"io_premium":49312,"so_notional":412808.19,"so_premium":6197.65,"io_pcr":1,"total_contracts":145698231,"total_turnover":26806388.16,"if_rev":0.7047,"sf_rev":2.4067,"fut_rev":3.1114,"io_rev":34.548,"so_rev":4.3421,"opt_rev":38.8901,"fo_rev":42.0015,"pn_ratio":0.0020777319915190897,"vix":11.0075,"cash_traded_value":91723.49,"cash_rev":5.4484,"total_rev":47.4499},{"date":"2025-10-14","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":26233.79,"sf_turnover":81578.49,"io_notional":68651686.59,"io_premium":72498.25,"so_notional":458170.99,"so_premium":7192.11,"io_pcr":1.06,"total_contracts":370820262,"total_turnover":69217669.86,"if_rev":0.9077,"sf_rev":2.8226,"fut_rev":3.7303,"io_rev":50.7923,"so_rev":5.0388,"opt_rev":55.8311,"fo_rev":59.5614,"pn_ratio":0.0011530968633201458,"vix":11.155,"cash_traded_value":109664.78,"cash_rev":6.5141,"total_rev":66.0755},{"date":"2025-10-15","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":23365.57,"sf_turnover":83736.32,"io_notional":12347622.91,"io_premium":36291.46,"so_notional":483727.19,"so_premium":7142.98,"io_pcr":0.87,"total_contracts":73024290,"total_turnover":12938451.99,"if_rev":0.8084,"sf_rev":2.8973,"fut_rev":3.7057,"io_rev":25.4258,"so_rev":5.0044,"opt_rev":30.4302,"fo_rev":34.1359,"pn_ratio":0.003385024932021768,"vix":10.53,"cash_traded_value":100716.49,"cash_rev":5.9826,"total_rev":40.1185},{"date":"2025-10-16","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":27221.99,"sf_turnover":104550.68,"io_notional":13631083.67,"io_premium":35397,"so_notional":573564.3,"so_premium":8283.35,"io_pcr":0.81,"total_contracts":80560062,"total_turnover":14336420.64,"if_rev":0.9419,"sf_rev":3.6175,"fut_rev":4.5593,"io_rev":24.7991,"so_rev":5.8033,"opt_rev":30.6025,"fo_rev":35.1618,"pn_ratio":0.0030750744469171098,"vix":10.865,"cash_traded_value":111717.03,"cash_rev":6.636,"total_rev":41.7978},{"date":"2025-10-17","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":33774.34,"sf_turnover":116636.96,"io_notional":31496122.43,"io_premium":72813.74,"so_notional":691469.05,"so_premium":8455.35,"io_pcr":0.78,"total_contracts":174301137,"total_turnover":32338002.78,"if_rev":1.1686,"sf_rev":4.0356,"fut_rev":5.2042,"io_rev":51.0133,"so_rev":5.9238,"opt_rev":56.9371,"fo_rev":62.1414,"pn_ratio":0.0025248577561479604,"vix":11.625,"cash_traded_value":111763.18,"cash_rev":6.6387,"total_rev":68.7801},{"date":"2025-10-20","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":26361.44,"sf_turnover":119378.53,"io_notional":64184083.54,"io_premium":68496.53,"so_notional":666586.06,"so_premium":7267.51,"io_pcr":0.96,"total_contracts":341363139,"total_turnover":64996409.57,"if_rev":0.9121,"sf_rev":4.1305,"fut_rev":5.0426,"io_rev":47.9887,"so_rev":5.0916,"opt_rev":53.0803,"fo_rev":58.1229,"pn_ratio":0.0011682846216903209,"vix":11.355,"cash_traded_value":100097.49,"cash_rev":5.9458,"total_rev":64.0687},{"date":"2025-10-21","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":5836.87,"sf_turnover":17168.65,"io_notional":2604489.19,"io_premium":6842.41,"so_notional":102048.31,"so_premium":933.61,"io_pcr":0.86,"total_contracts":14990656,"total_turnover":2729543.02,"if_rev":0.202,"sf_rev":0.594,"fut_rev":0.796,"io_rev":4.7938,"so_rev":0.6541,"opt_rev":5.4479,"fo_rev":6.2439,"pn_ratio":0.002873050899904398,"vix":11.2975,"cash_traded_value":19714.12,"cash_rev":1.171,"total_rev":7.4149},{"date":"2025-10-23","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":44950.71,"sf_turnover":336529.28,"io_notional":15034590.84,"io_premium":43229.69,"so_notional":785436.02,"so_premium":7744.5,"io_pcr":0.96,"total_contracts":92371158,"total_turnover":16201506.85,"if_rev":1.5553,"sf_rev":11.6439,"fut_rev":13.1992,"io_rev":30.2867,"so_rev":5.4258,"opt_rev":35.7125,"fo_rev":48.9117,"pn_ratio":0.0032221304332222863,"vix":11.7325,"cash_traded_value":116842.34,"cash_rev":6.9404,"total_rev":55.8521},{"date":"2025-10-24","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":43477.87,"sf_turnover":366744.46,"io_notional":26794393.7,"io_premium":65545.61,"so_notional":659480.73,"so_premium":6097.94,"io_pcr":1.08,"total_contracts":151400484,"total_turnover":27864096.76,"if_rev":1.5043,"sf_rev":12.6894,"fut_rev":14.1937,"io_rev":45.9213,"so_rev":4.2722,"opt_rev":50.1935,"fo_rev":64.3872,"pn_ratio":0.002609597060067853,"vix":11.59,"cash_traded_value":89132.4,"cash_rev":5.2945,"total_rev":69.6817},{"date":"2025-10-27","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":55444.01,"sf_turnover":345736.65,"io_notional":29751358.44,"io_premium":61709.32,"so_notional":669610.17,"so_premium":6550.21,"io_pcr":0.96,"total_contracts":166090242,"total_turnover":30822149.27,"if_rev":1.9184,"sf_rev":11.9625,"fut_rev":13.8809,"io_rev":43.2335,"so_rev":4.5891,"opt_rev":47.8226,"fo_rev":61.7035,"pn_ratio":0.002243831577984722,"vix":11.8575,"cash_traded_value":96754.8,"cash_rev":5.7472,"total_rev":67.4507},{"date":"2025-10-28","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":63149.26,"sf_turnover":259510.7,"io_notional":80193088.33,"io_premium":91654.73,"so_notional":465227.6,"so_premium":6596.36,"io_pcr":0.94,"total_contracts":419632221,"total_turnover":80980975.89,"if_rev":2.185,"sf_rev":8.9791,"fut_rev":11.164,"io_rev":64.2133,"so_rev":4.6214,"opt_rev":68.8347,"fo_rev":79.9987,"pn_ratio":0.00121811482011685,"vix":11.9525,"cash_traded_value":116153.19,"cash_rev":6.8995,"total_rev":86.8982},{"date":"2025-10-29","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":25079.82,"sf_turnover":95682.85,"io_notional":10497901.12,"io_premium":40037.92,"so_notional":406693.68,"so_premium":8489.08,"io_pcr":0.86,"total_contracts":60834121,"total_turnover":11025357.47,"if_rev":0.8678,"sf_rev":3.3106,"fut_rev":4.1784,"io_rev":28.0506,"so_rev":5.9474,"opt_rev":33.998,"fo_rev":38.1764,"pn_ratio":0.004450142429868188,"vix":11.9725,"cash_traded_value":112298.42,"cash_rev":6.6705,"total_rev":44.8469},{"date":"2025-10-30","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":22964.33,"sf_turnover":82614.27,"io_notional":11266112.03,"io_premium":35763.21,"so_notional":348194.68,"so_premium":6918.59,"io_pcr":0.96,"total_contracts":63704469,"total_turnover":11719885.31,"if_rev":0.7946,"sf_rev":2.8585,"fut_rev":3.653,"io_rev":25.0557,"so_rev":4.8472,"opt_rev":29.9029,"fo_rev":33.5559,"pn_ratio":0.0036749330860403983,"vix":12.0675,"cash_traded_value":102485.84,"cash_rev":6.0877,"total_rev":39.6436},{"date":"2025-10-31","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 October","fy":"FY 2026","if_turnover":24716.39,"sf_turnover":92146.67,"io_notional":20651657.16,"io_premium":53507.84,"so_notional":422351.7,"so_premium":7887.26,"io_pcr":0.99,"total_contracts":113152361,"total_turnover":21190871.92,"if_rev":0.8552,"sf_rev":3.1883,"fut_rev":4.0435,"io_rev":37.4876,"so_rev":5.5258,"opt_rev":43.0134,"fo_rev":47.0569,"pn_ratio":0.0029133090152833885,"vix":12.1525,"cash_traded_value":110386.57,"cash_rev":6.557,"total_rev":53.6139},{"date":"2025-11-03","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":18890.63,"sf_turnover":82224.48,"io_notional":25462487.09,"io_premium":51382.09,"so_notional":398730.44,"so_premium":7206.85,"io_pcr":0.91,"total_contracts":138017990,"total_turnover":25962332.64,"if_rev":0.6536,"sf_rev":2.845,"fut_rev":3.4986,"io_rev":35.9983,"so_rev":5.0491,"opt_rev":41.0474,"fo_rev":44.546,"pn_ratio":0.002265513598964727,"vix":12.665,"cash_traded_value":99211.02,"cash_rev":5.8931,"total_rev":50.4391},{"date":"2025-11-04","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":21245.53,"sf_turnover":84155.36,"io_notional":54658857.99,"io_premium":56381.43,"so_notional":402341.31,"so_premium":6662.77,"io_pcr":1,"total_contracts":289871221,"total_turnover":55166600.19,"if_rev":0.7351,"sf_rev":2.9118,"fut_rev":3.6469,"io_rev":39.5008,"so_rev":4.6679,"opt_rev":44.1688,"fo_rev":47.8156,"pn_ratio":0.0011449841413098314,"vix":12.6525,"cash_traded_value":103983.71,"cash_rev":6.1766,"total_rev":53.9922},{"date":"2025-11-06","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":18427.29,"sf_turnover":93843.35,"io_notional":11496890.15,"io_premium":33033.86,"so_notional":451055.34,"so_premium":6862.03,"io_pcr":0.94,"total_contracts":67127811,"total_turnover":12060216.13,"if_rev":0.6376,"sf_rev":3.247,"fut_rev":3.8846,"io_rev":23.1435,"so_rev":4.8075,"opt_rev":27.9511,"fo_rev":31.8356,"pn_ratio":0.0033391422846205166,"vix":12.41,"cash_traded_value":114454.44,"cash_rev":6.7986,"total_rev":38.6342},{"date":"2025-11-07","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":28878.76,"sf_turnover":98400.5,"io_notional":22864191.88,"io_premium":55450.7,"so_notional":554326.65,"so_premium":8508.64,"io_pcr":0.93,"total_contracts":127988078,"total_turnover":23545797.79,"if_rev":0.9992,"sf_rev":3.4047,"fut_rev":4.4039,"io_rev":38.8488,"so_rev":5.9612,"opt_rev":44.8099,"fo_rev":49.2138,"pn_ratio":0.0027311437279034408,"vix":12.5575,"cash_traded_value":118390.89,"cash_rev":7.0324,"total_rev":56.2462},{"date":"2025-11-10","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":14796.32,"sf_turnover":75764.93,"io_notional":24084623.76,"io_premium":44912.75,"so_notional":451327.28,"so_premium":6642.05,"io_pcr":0.95,"total_contracts":132793891,"total_turnover":24626512.29,"if_rev":0.512,"sf_rev":2.6215,"fut_rev":3.1334,"io_rev":31.4659,"so_rev":4.6534,"opt_rev":36.1193,"fo_rev":39.2527,"pn_ratio":0.0021011942808311047,"vix":12.3,"cash_traded_value":101317.69,"cash_rev":6.0183,"total_rev":45.271},{"date":"2025-11-11","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":25404.98,"sf_turnover":87282.46,"io_notional":65599609.04,"io_premium":70621.49,"so_notional":496073.63,"so_premium":6960.91,"io_pcr":0.93,"total_contracts":349452241,"total_turnover":66208370.11,"if_rev":0.879,"sf_rev":3.02,"fut_rev":3.899,"io_rev":49.4774,"so_rev":4.8768,"opt_rev":54.3542,"fo_rev":58.2532,"pn_ratio":0.0011737892229262605,"vix":12.49,"cash_traded_value":104375.46,"cash_rev":6.1999,"total_rev":64.4531},{"date":"2025-11-12","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":24149.82,"sf_turnover":97649.73,"io_notional":9316209.53,"io_premium":32149.26,"so_notional":631090.48,"so_premium":9032.06,"io_pcr":0.95,"total_contracts":58035434,"total_turnover":10069099.56,"if_rev":0.8356,"sf_rev":3.3787,"fut_rev":4.2143,"io_rev":22.5238,"so_rev":6.3279,"opt_rev":28.8516,"fo_rev":33.0659,"pn_ratio":0.0041399495298825315,"vix":12.11,"cash_traded_value":115992.45,"cash_rev":6.89,"total_rev":39.9559},{"date":"2025-11-13","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":22137.73,"sf_turnover":94704.9,"io_notional":11331297.24,"io_premium":35847.55,"so_notional":597247.93,"so_premium":7983.72,"io_pcr":0.9,"total_contracts":67596272,"total_turnover":12045387.8,"if_rev":0.766,"sf_rev":3.2768,"fut_rev":4.0428,"io_rev":25.1148,"so_rev":5.5934,"opt_rev":30.7082,"fo_rev":34.7509,"pn_ratio":0.003674485813260328,"vix":12.1625,"cash_traded_value":110637.5,"cash_rev":6.5719,"total_rev":41.3228},{"date":"2025-11-14","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":30878.62,"sf_turnover":87524.89,"io_notional":24159574.33,"io_premium":65530.55,"so_notional":567091.25,"so_premium":7171.68,"io_pcr":0.91,"total_contracts":133333061,"total_turnover":24845069.09,"if_rev":1.0684,"sf_rev":3.0284,"fut_rev":4.0968,"io_rev":45.9107,"so_rev":5.0245,"opt_rev":50.9352,"fo_rev":55.0319,"pn_ratio":0.0029402359070526975,"vix":11.9375,"cash_traded_value":112397.08,"cash_rev":6.6764,"total_rev":61.7083},{"date":"2025-11-17","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":19200.31,"sf_turnover":83988.24,"io_notional":22966768.81,"io_premium":46284.9,"so_notional":545044.42,"so_premium":6286.75,"io_pcr":0.98,"total_contracts":126696480,"total_turnover":23615001.78,"if_rev":0.6643,"sf_rev":2.906,"fut_rev":3.5703,"io_rev":32.4272,"so_rev":4.4045,"opt_rev":36.8317,"fo_rev":40.402,"pn_ratio":0.0022359674894372236,"vix":11.7875,"cash_traded_value":99600.19,"cash_rev":5.9163,"total_rev":46.3183},{"date":"2025-11-18","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":21624.33,"sf_turnover":92034.09,"io_notional":56166255.71,"io_premium":61404.97,"so_notional":578716.61,"so_premium":5949.61,"io_pcr":0.99,"total_contracts":297474234,"total_turnover":56858630.74,"if_rev":0.7482,"sf_rev":3.1844,"fut_rev":3.9326,"io_rev":43.0203,"so_rev":4.1683,"opt_rev":47.1886,"fo_rev":51.1212,"pn_ratio":0.0011869700036184633,"vix":12.095,"cash_traded_value":117064.74,"cash_rev":6.9536,"total_rev":58.0748},{"date":"2025-11-19","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":24548.7,"sf_turnover":109118.15,"io_notional":10825377.18,"io_premium":37299.41,"so_notional":688273.71,"so_premium":6441.45,"io_pcr":0.9,"total_contracts":66579768,"total_turnover":11647317.74,"if_rev":0.8494,"sf_rev":3.7755,"fut_rev":4.6249,"io_rev":26.132,"so_rev":4.5129,"opt_rev":30.6448,"fo_rev":35.2697,"pn_ratio":0.0037990434500659066,"vix":11.9725,"cash_traded_value":98010.09,"cash_rev":5.8218,"total_rev":41.0915},{"date":"2025-11-20","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":37377.49,"sf_turnover":298253.58,"io_notional":10905816.82,"io_premium":31427.08,"so_notional":740492.95,"so_premium":6235.68,"io_pcr":0.96,"total_contracts":69963892,"total_turnover":11981940.84,"if_rev":1.2933,"sf_rev":10.3196,"fut_rev":11.6128,"io_rev":22.0178,"so_rev":4.3687,"opt_rev":26.3865,"fo_rev":37.9994,"pn_ratio":0.0032338792925649617,"vix":12.135,"cash_traded_value":96628.32,"cash_rev":5.7397,"total_rev":43.7391},{"date":"2025-11-21","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":55169.82,"sf_turnover":344314.1,"io_notional":20350593.01,"io_premium":54557.41,"so_notional":748916.96,"so_premium":5806.76,"io_pcr":1.06,"total_contracts":118914955,"total_turnover":21498993.89,"if_rev":1.9089,"sf_rev":11.9133,"fut_rev":13.8221,"io_rev":38.2229,"so_rev":4.0682,"opt_rev":42.2911,"fo_rev":56.1133,"pn_ratio":0.0028609275801109993,"vix":13.63,"cash_traded_value":90836.23,"cash_rev":5.3957,"total_rev":61.509},{"date":"2025-11-24","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":51552.85,"sf_turnover":338718.92,"io_notional":26775021.97,"io_premium":54252.45,"so_notional":633054.38,"so_premium":5038.83,"io_pcr":1.06,"total_contracts":149853718,"total_turnover":27798348.12,"if_rev":1.7837,"sf_rev":11.7197,"fut_rev":13.5034,"io_rev":38.0093,"so_rev":3.5302,"opt_rev":41.5395,"fo_rev":55.0429,"pn_ratio":0.002163277686578686,"vix":13.235,"cash_traded_value":154230.67,"cash_rev":9.1613,"total_rev":64.2042},{"date":"2025-11-25","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":46908.67,"sf_turnover":231427.86,"io_notional":68386910.45,"io_premium":70345.44,"so_notional":402986.32,"so_premium":5074.42,"io_pcr":0.95,"total_contracts":356213773,"total_turnover":69068233.3,"if_rev":1.623,"sf_rev":8.0074,"fut_rev":9.6304,"io_rev":49.284,"so_rev":3.5551,"opt_rev":52.8392,"fo_rev":62.4696,"pn_ratio":0.0010963798979400621,"vix":12.2425,"cash_traded_value":87713.53,"cash_rev":5.2102,"total_rev":67.6798},{"date":"2025-11-26","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":28959.83,"sf_turnover":72268.05,"io_notional":10457219.7,"io_premium":35509.69,"so_notional":308324.58,"so_premium":5661.23,"io_pcr":0.84,"total_contracts":58566579,"total_turnover":10866772.16,"if_rev":1.002,"sf_rev":2.5005,"fut_rev":3.5025,"io_rev":24.8781,"so_rev":3.9663,"opt_rev":28.8443,"fo_rev":32.3468,"pn_ratio":0.0038243231302746545,"vix":11.9675,"cash_traded_value":94725.02,"cash_rev":5.6267,"total_rev":37.9735},{"date":"2025-11-27","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":21238.44,"sf_turnover":67748.23,"io_notional":12108594.06,"io_premium":35972.95,"so_notional":289694.24,"so_premium":5102.07,"io_pcr":0.97,"total_contracts":66330478,"total_turnover":12487274.97,"if_rev":0.7349,"sf_rev":2.3441,"fut_rev":3.0789,"io_rev":25.2026,"so_rev":3.5745,"opt_rev":28.7772,"fo_rev":31.8561,"pn_ratio":0.0033129589348232847,"vix":11.785,"cash_traded_value":84815.42,"cash_rev":5.038,"total_rev":36.8941},{"date":"2025-11-28","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 November","fy":"FY 2026","if_turnover":12218.54,"sf_turnover":55695.44,"io_notional":16142493.25,"io_premium":40913.41,"so_notional":278420.21,"so_premium":4996.6,"io_pcr":1.03,"total_contracts":86483736,"total_turnover":16488827.44,"if_rev":0.4228,"sf_rev":1.9271,"fut_rev":2.3498,"io_rev":28.6639,"so_rev":3.5006,"opt_rev":32.1646,"fo_rev":34.5144,"pn_ratio":0.0027958255861851426,"vix":11.6175,"cash_traded_value":82568.35,"cash_rev":4.9046,"total_rev":39.419},{"date":"2025-12-01","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":20732.18,"sf_turnover":61832.42,"io_notional":27182062.6,"io_premium":52638.02,"so_notional":315499.82,"so_premium":5324.63,"io_pcr":1.09,"total_contracts":143132920,"total_turnover":27580127.02,"if_rev":0.7173,"sf_rev":2.1394,"fut_rev":2.8567,"io_rev":36.8782,"so_rev":3.7304,"opt_rev":40.6086,"fo_rev":43.4654,"pn_ratio":0.002107919571730533,"vix":11.625,"cash_traded_value":85216.3,"cash_rev":5.0618,"total_rev":48.5272},{"date":"2025-12-02","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":21321.6,"sf_turnover":62018.99,"io_notional":56485895.95,"io_premium":59179.47,"so_notional":264921.07,"so_premium":4385.08,"io_pcr":1.09,"total_contracts":292833563,"total_turnover":56834157.61,"if_rev":0.7377,"sf_rev":2.1459,"fut_rev":2.8836,"io_rev":41.4611,"so_rev":3.0722,"opt_rev":44.5333,"fo_rev":47.4169,"pn_ratio":0.0011200640508417477,"vix":11.2275,"cash_traded_value":93813.57,"cash_rev":5.5725,"total_rev":52.9894},{"date":"2025-12-03","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":24816.74,"sf_turnover":76078.76,"io_notional":10288196.25,"io_premium":33573.53,"so_notional":354207.53,"so_premium":5349.74,"io_pcr":0.95,"total_contracts":58494984,"total_turnover":10743299.28,"if_rev":0.8587,"sf_rev":2.6323,"fut_rev":3.491,"io_rev":23.5216,"so_rev":3.748,"opt_rev":27.2696,"fo_rev":30.7606,"pn_ratio":0.003657375796354158,"vix":11.2125,"cash_traded_value":93381.69,"cash_rev":5.5469,"total_rev":36.3075},{"date":"2025-12-04","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":19004.65,"sf_turnover":64642.42,"io_notional":10854412.53,"io_premium":31035.35,"so_notional":325192.71,"so_premium":5027.05,"io_pcr":0.92,"total_contracts":60896531,"total_turnover":11263252.31,"if_rev":0.6576,"sf_rev":2.2366,"fut_rev":2.8942,"io_rev":21.7434,"so_rev":3.522,"opt_rev":25.2653,"fo_rev":28.1595,"pn_ratio":0.003225731072414861,"vix":10.8175,"cash_traded_value":88337,"cash_rev":5.2472,"total_rev":33.4067},{"date":"2025-12-05","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":27048.39,"sf_turnover":77905.32,"io_notional":22047720.34,"io_premium":50753.95,"so_notional":424274.22,"so_premium":6932.09,"io_pcr":0.93,"total_contracts":119543385,"total_turnover":22576948.27,"if_rev":0.9359,"sf_rev":2.6955,"fut_rev":3.6314,"io_rev":35.5582,"so_rev":4.8566,"opt_rev":40.4148,"fo_rev":44.0462,"pn_ratio":0.0025670191333474583,"vix":10.315,"cash_traded_value":91780.56,"cash_rev":5.4518,"total_rev":49.498},{"date":"2025-12-08","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":28422.24,"sf_turnover":85350.5,"io_notional":31481232.9,"io_premium":56102.4,"so_notional":471452.65,"so_premium":7573.93,"io_pcr":1.03,"total_contracts":168498467,"total_turnover":32066458.29,"if_rev":0.9834,"sf_rev":2.9531,"fut_rev":3.9365,"io_rev":39.3053,"so_rev":5.3063,"opt_rev":44.6116,"fo_rev":48.5482,"pn_ratio":0.001992831866991537,"vix":11.125,"cash_traded_value":96755.79,"cash_rev":5.7473,"total_rev":54.2955},{"date":"2025-12-09","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":26671.22,"sf_turnover":79541.23,"io_notional":71976652.98,"io_premium":77379.26,"so_notional":421623.92,"so_premium":6450.18,"io_pcr":0.93,"total_contracts":377458103,"total_turnover":72504489.35,"if_rev":0.9228,"sf_rev":2.7521,"fut_rev":3.675,"io_rev":54.2119,"so_rev":4.519,"opt_rev":58.7309,"fo_rev":62.4059,"pn_ratio":0.0011578927508977771,"vix":10.9525,"cash_traded_value":106148.28,"cash_rev":6.3052,"total_rev":68.7111},{"date":"2025-12-10","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":20484.22,"sf_turnover":69799.66,"io_notional":13282894.39,"io_premium":42114.56,"so_notional":406670.25,"so_premium":6297.13,"io_pcr":0.98,"total_contracts":74998342,"total_turnover":13779848.52,"if_rev":0.7088,"sf_rev":2.4151,"fut_rev":3.1238,"io_rev":29.5055,"so_rev":4.4118,"opt_rev":33.9172,"fo_rev":37.0411,"pn_ratio":0.003536393689142184,"vix":10.9125,"cash_traded_value":95826.74,"cash_rev":5.6921,"total_rev":42.7332},{"date":"2025-12-11","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":23020.7,"sf_turnover":68038.82,"io_notional":13819586.77,"io_premium":39342.62,"so_notional":399952.68,"so_premium":5821.24,"io_pcr":0.91,"total_contracts":77701298,"total_turnover":14310598.97,"if_rev":0.7965,"sf_rev":2.3541,"fut_rev":3.1507,"io_rev":27.5634,"so_rev":4.0784,"opt_rev":31.6418,"fo_rev":34.7925,"pn_ratio":0.0031761830373486536,"vix":10.4,"cash_traded_value":79300.78,"cash_rev":4.7105,"total_rev":39.503},{"date":"2025-12-12","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":21081.3,"sf_turnover":69786.67,"io_notional":19924468.08,"io_premium":47867.57,"so_notional":444372.01,"so_premium":6382.76,"io_pcr":0.97,"total_contracts":109397043,"total_turnover":20459708.06,"if_rev":0.7294,"sf_rev":2.4146,"fut_rev":3.144,"io_rev":33.536,"so_rev":4.4718,"opt_rev":38.0078,"fo_rev":41.1518,"pn_ratio":0.0026633981002499,"vix":10.1075,"cash_traded_value":86390.02,"cash_rev":5.1316,"total_rev":46.2834},{"date":"2025-12-15","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":18247.44,"sf_turnover":63697.15,"io_notional":26416168.03,"io_premium":48390.25,"so_notional":386210.88,"so_premium":5272.71,"io_pcr":0.98,"total_contracts":141784176,"total_turnover":26884323.5,"if_rev":0.6314,"sf_rev":2.2039,"fut_rev":2.8353,"io_rev":33.9022,"so_rev":3.6941,"opt_rev":37.5963,"fo_rev":40.4316,"pn_ratio":0.002002171530377786,"vix":10.25,"cash_traded_value":79300.78,"cash_rev":4.7105,"total_rev":45.1421},{"date":"2025-12-16","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":20580.92,"sf_turnover":72858.18,"io_notional":52145386.38,"io_premium":53632.17,"so_notional":411849.82,"so_premium":4980.32,"io_pcr":1.03,"total_contracts":274777912,"total_turnover":52650675.3,"if_rev":0.7121,"sf_rev":2.5209,"fut_rev":3.233,"io_rev":37.5747,"so_rev":3.4892,"opt_rev":41.0639,"fo_rev":44.2969,"pn_ratio":0.0011152125613484978,"vix":10.0625,"cash_traded_value":83984.54,"cash_rev":4.9887,"total_rev":49.2856},{"date":"2025-12-17","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":15636.34,"sf_turnover":67925.17,"io_notional":9835377.25,"io_premium":31167.83,"so_notional":425571.08,"so_premium":4998.61,"io_pcr":0.98,"total_contracts":57394859,"total_turnover":10344509.84,"if_rev":0.541,"sf_rev":2.3502,"fut_rev":2.8912,"io_rev":21.8362,"so_rev":3.502,"opt_rev":25.3382,"fo_rev":28.2294,"pn_ratio":0.0035246683675679326,"vix":9.8375,"cash_traded_value":85179.75,"cash_rev":5.0597,"total_rev":33.2891},{"date":"2025-12-18","day":"Thursday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":21165.28,"sf_turnover":87720.89,"io_notional":11627181.52,"io_premium":31875.63,"so_notional":498710.54,"so_premium":5426.84,"io_pcr":0.91,"total_contracts":68168497,"total_turnover":12234778.23,"if_rev":0.7323,"sf_rev":3.0351,"fut_rev":3.7675,"io_rev":22.3321,"so_rev":3.802,"opt_rev":26.1341,"fo_rev":29.9016,"pn_ratio":0.0030762660442154722,"vix":9.7075,"cash_traded_value":87865.32,"cash_rev":5.2192,"total_rev":35.1208},{"date":"2025-12-19","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":18677.45,"sf_turnover":101528.99,"io_notional":16980462,"io_premium":39735.4,"so_notional":601791.33,"so_premium":6521.6,"io_pcr":0.98,"total_contracts":97247355,"total_turnover":17702459.77,"if_rev":0.6462,"sf_rev":3.5129,"fut_rev":4.1591,"io_rev":27.8386,"so_rev":4.569,"opt_rev":32.4077,"fo_rev":36.5668,"pn_ratio":0.002630891452409758,"vix":9.5225,"cash_traded_value":124141.41,"cash_rev":7.374,"total_rev":43.9408},{"date":"2025-12-22","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":16033.87,"sf_turnover":118073.28,"io_notional":16821853.61,"io_premium":29849.96,"so_notional":732380.38,"so_premium":8123.09,"io_pcr":1.04,"total_contracts":97848010,"total_turnover":17688341.14,"if_rev":0.5548,"sf_rev":4.0853,"fut_rev":4.6401,"io_rev":20.9129,"so_rev":5.691,"opt_rev":26.6039,"fo_rev":31.244,"pn_ratio":0.0021631846779319366,"vix":9.675,"cash_traded_value":97458.45,"cash_rev":5.789,"total_rev":37.033},{"date":"2025-12-23","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":14382.37,"sf_turnover":165375.98,"io_notional":49433430.52,"io_premium":45869,"so_notional":632236.23,"so_premium":6077.95,"io_pcr":1.02,"total_contracts":263281419,"total_turnover":50245425.1,"if_rev":0.4976,"sf_rev":5.722,"fut_rev":6.2196,"io_rev":32.1358,"so_rev":4.2582,"opt_rev":36.394,"fo_rev":42.6137,"pn_ratio":0.0010375763147107194,"vix":9.3775,"cash_traded_value":89155.76,"cash_rev":5.2959,"total_rev":47.9096},{"date":"2025-12-24","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":21730.89,"sf_turnover":266640.52,"io_notional":9394178.23,"io_premium":23258.25,"so_notional":721705.59,"so_premium":6161.43,"io_pcr":0.99,"total_contracts":62026027,"total_turnover":10404255.23,"if_rev":0.7519,"sf_rev":9.2258,"fut_rev":9.9777,"io_rev":16.2947,"so_rev":4.3167,"opt_rev":20.6114,"fo_rev":30.5891,"pn_ratio":0.0029082659037497722,"vix":9.19,"cash_traded_value":86241.02,"cash_rev":5.1227,"total_rev":35.7118},{"date":"2025-12-26","day":"Friday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":35816.75,"sf_turnover":292795.89,"io_notional":14039127.73,"io_premium":28262.93,"so_notional":741693.49,"so_premium":6417.78,"io_pcr":0.96,"total_contracts":86825922,"total_turnover":15109433.86,"if_rev":1.2393,"sf_rev":10.1307,"fut_rev":11.37,"io_rev":19.801,"so_rev":4.4963,"opt_rev":24.2973,"fo_rev":35.6673,"pn_ratio":0.002346331741911157,"vix":9.15,"cash_traded_value":81553.79,"cash_rev":4.8443,"total_rev":40.5116},{"date":"2025-12-29","day":"Monday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":43024.12,"sf_turnover":271185.5,"io_notional":23451866.13,"io_premium":37681.46,"so_notional":751012.81,"so_premium":6316.76,"io_pcr":1.05,"total_contracts":134911844,"total_turnover":24517088.56,"if_rev":1.4886,"sf_rev":9.383,"fut_rev":10.8717,"io_rev":26.3996,"so_rev":4.4255,"opt_rev":30.8252,"fo_rev":41.6968,"pn_ratio":0.0018178919999175935,"vix":9.72,"cash_traded_value":103927.9,"cash_rev":6.1733,"total_rev":47.8701},{"date":"2025-12-30","day":"Tuesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":47275.64,"sf_turnover":261271.12,"io_notional":65517280.47,"io_premium":58308.82,"so_notional":517133.57,"so_premium":6476.03,"io_pcr":0.89,"total_contracts":345607491,"total_turnover":66342960.8,"if_rev":1.6357,"sf_rev":9.04,"fut_rev":10.6757,"io_rev":40.8512,"so_rev":4.5371,"opt_rev":45.3883,"fo_rev":56.064,"pn_ratio":0.0009810770783966814,"vix":9.6775,"cash_traded_value":141795.39,"cash_rev":8.4226,"total_rev":64.4866},{"date":"2025-12-31","day":"Wednesday","fy_quarter":"Q3 FY 2026","fy_month":"FY 2026 December","fy":"FY 2026","if_turnover":20777.13,"sf_turnover":80529.12,"io_notional":10440576.96,"io_premium":28904.6,"so_notional":350489.9,"so_premium":6724.97,"io_pcr":0.88,"total_contracts":67329545,"total_turnover":10892373.11,"if_rev":0.7189,"sf_rev":2.7863,"fut_rev":3.5052,"io_rev":20.2506,"so_rev":4.7115,"opt_rev":24.9621,"fo_rev":28.4673,"pn_ratio":0.0033017652899613296,"vix":9.475,"cash_traded_value":100695.76,"cash_rev":5.9813,"total_rev":34.4486},{"date":"2026-01-01","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":8733.8,"sf_turnover":59407.42,"io_notional":8557955.03,"io_premium":19746.32,"so_notional":317539.5,"so_premium":5523.03,"io_pcr":1.04,"total_contracts":55686383,"total_turnover":8943635.75,"if_rev":0.3022,"sf_rev":2.0555,"fut_rev":2.3577,"io_rev":13.8343,"so_rev":3.8694,"opt_rev":17.7037,"fo_rev":20.0614,"pn_ratio":0.0028470920594438134,"vix":9.185,"cash_traded_value":80232.39,"cash_rev":4.7658,"total_rev":24.8272},{"date":"2026-01-02","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":18378.96,"sf_turnover":86439.21,"io_notional":15748577.44,"io_premium":31785.99,"so_notional":482811.1,"so_premium":8432.95,"io_pcr":0.9,"total_contracts":100384959,"total_turnover":16336206.71,"if_rev":0.6359,"sf_rev":2.9908,"fut_rev":3.6267,"io_rev":22.2693,"so_rev":5.9081,"opt_rev":28.1774,"fo_rev":31.8041,"pn_ratio":0.0024778496245645293,"vix":9.45,"cash_traded_value":102438.51,"cash_rev":6.0848,"total_rev":37.8889},{"date":"2026-01-05","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":21220.13,"sf_turnover":90242.05,"io_notional":29767917.06,"io_premium":48890.39,"so_notional":494578.31,"so_premium":7922.97,"io_pcr":1.01,"total_contracts":182323279,"total_turnover":30373957.55,"if_rev":0.7342,"sf_rev":3.1224,"fut_rev":3.8566,"io_rev":34.2526,"so_rev":5.5508,"opt_rev":39.8034,"fo_rev":43.66,"pn_ratio":0.0018773521253082311,"vix":10.0225,"cash_traded_value":104602.45,"cash_rev":6.2134,"total_rev":49.8734},{"date":"2026-01-06","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":16695.49,"sf_turnover":96616.62,"io_notional":57659443.67,"io_premium":54904.36,"so_notional":542202.76,"so_premium":8753.64,"io_pcr":1.06,"total_contracts":347396994,"total_turnover":58314958.54,"if_rev":0.5777,"sf_rev":3.3429,"fut_rev":3.9206,"io_rev":38.466,"so_rev":6.1328,"opt_rev":44.5988,"fo_rev":48.5194,"pn_ratio":0.0010937491274677674,"vix":10.0175,"cash_traded_value":109454.06,"cash_rev":6.5016,"total_rev":55.021},{"date":"2026-01-07","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":16038.87,"sf_turnover":92812.06,"io_notional":11877251.99,"io_premium":32128.44,"so_notional":540273.42,"so_premium":8995.07,"io_pcr":0.98,"total_contracts":78549714,"total_turnover":12526376.34,"if_rev":0.5549,"sf_rev":3.2113,"fut_rev":3.7662,"io_rev":22.5092,"so_rev":6.3019,"opt_rev":28.8111,"fo_rev":32.5774,"pn_ratio":0.003311731495784392,"vix":9.95,"cash_traded_value":106463.18,"cash_rev":6.3239,"total_rev":38.9013},{"date":"2026-01-08","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":27927.7,"sf_turnover":103608.43,"io_notional":14200170.1,"io_premium":33760.09,"so_notional":551718.18,"so_premium":8679.69,"io_pcr":0.96,"total_contracts":92925012,"total_turnover":14883424.41,"if_rev":0.9663,"sf_rev":3.5849,"fut_rev":4.5512,"io_rev":23.6523,"so_rev":6.081,"opt_rev":29.7333,"fo_rev":34.2845,"pn_ratio":0.002876904921896548,"vix":10.6,"cash_traded_value":108954.13,"cash_rev":6.4719,"total_rev":40.7564},{"date":"2026-01-09","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":25042.79,"sf_turnover":101413.22,"io_notional":24982804.05,"io_premium":58341.07,"so_notional":538621.25,"so_premium":8921.23,"io_pcr":1.13,"total_contracts":157551409,"total_turnover":25647881.31,"if_rev":0.8665,"sf_rev":3.5089,"fut_rev":4.3754,"io_rev":40.8738,"so_rev":6.2502,"opt_rev":47.124,"fo_rev":51.4993,"pn_ratio":0.002635522867917569,"vix":10.925,"cash_traded_value":106746.84,"cash_rev":6.3408,"total_rev":57.8401},{"date":"2026-01-12","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":30713.57,"sf_turnover":93256.71,"io_notional":39491731.8,"io_premium":77349.99,"so_notional":530066.22,"so_premium":7744.18,"io_pcr":0.89,"total_contracts":244867468,"total_turnover":40145768.3,"if_rev":1.0627,"sf_rev":3.2267,"fut_rev":4.2894,"io_rev":54.1914,"so_rev":5.4256,"opt_rev":59.617,"fo_rev":63.9063,"pn_ratio":0.002126195578656314,"vix":11.3675,"cash_traded_value":103691.69,"cash_rev":6.1593,"total_rev":70.0656},{"date":"2026-01-13","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":22260.78,"sf_turnover":88618.45,"io_notional":79898393.38,"io_premium":85854.08,"so_notional":501140.64,"so_premium":6828.76,"io_pcr":1,"total_contracts":485451686,"total_turnover":80510413.25,"if_rev":0.7702,"sf_rev":3.0662,"fut_rev":3.8364,"io_rev":60.1494,"so_rev":4.7842,"opt_rev":64.9336,"fo_rev":68.77,"pn_ratio":0.0011527783230303851,"vix":11.1975,"cash_traded_value":101636.97,"cash_rev":6.0372,"total_rev":74.8072},{"date":"2026-01-14","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":18295.7,"sf_turnover":93667.42,"io_notional":11885744.04,"io_premium":38604.15,"so_notional":595285.49,"so_premium":8746.04,"io_pcr":0.92,"total_contracts":80204117,"total_turnover":12592992.65,"if_rev":0.633,"sf_rev":3.2409,"fut_rev":3.8739,"io_rev":27.0461,"so_rev":6.1275,"opt_rev":33.1735,"fo_rev":37.0475,"pn_ratio":0.003793772772204955,"vix":11.32,"cash_traded_value":109538.1,"cash_rev":6.5066,"total_rev":43.5541},{"date":"2026-01-16","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":25416.32,"sf_turnover":120205.27,"io_notional":26092397.84,"io_premium":65305.74,"so_notional":752419.84,"so_premium":9857.72,"io_pcr":0.96,"total_contracts":167212227,"total_turnover":26990439.27,"if_rev":0.8794,"sf_rev":4.1591,"fut_rev":5.0385,"io_rev":45.7532,"so_rev":6.9063,"opt_rev":52.6595,"fo_rev":57.698,"pn_ratio":0.002799924398667028,"vix":11.3725,"cash_traded_value":125067.43,"cash_rev":7.429,"total_rev":65.127},{"date":"2026-01-19","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":21350.11,"sf_turnover":119890.88,"io_notional":32234273.26,"io_premium":62463.16,"so_notional":794426.75,"so_premium":8915.62,"io_pcr":0.93,"total_contracts":205696242,"total_turnover":33169941,"if_rev":0.7387,"sf_rev":4.1482,"fut_rev":4.8869,"io_rev":43.7617,"so_rev":6.2463,"opt_rev":50.008,"fo_rev":54.8949,"pn_ratio":0.0021611138185392963,"vix":11.8275,"cash_traded_value":111002.74,"cash_rev":6.5936,"total_rev":61.4885},{"date":"2026-01-20","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":28584.52,"sf_turnover":146330.17,"io_notional":67649275.59,"io_premium":74390.62,"so_notional":804647.6,"so_premium":8368.72,"io_pcr":1.11,"total_contracts":421751708,"total_turnover":68628837.88,"if_rev":0.989,"sf_rev":5.063,"fut_rev":6.052,"io_rev":52.1181,"so_rev":5.8631,"opt_rev":57.9812,"fo_rev":64.0332,"pn_ratio":0.0012089787720463302,"vix":12.73,"cash_traded_value":125153.83,"cash_rev":7.4341,"total_rev":71.4673},{"date":"2026-01-21","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":49060.79,"sf_turnover":324187.97,"io_notional":19181199.27,"io_premium":73459.84,"so_notional":909840.93,"so_premium":9327.41,"io_pcr":1.03,"total_contracts":133960796,"total_turnover":20464288.96,"if_rev":1.6975,"sf_rev":11.2169,"fut_rev":12.9144,"io_rev":51.466,"so_rev":6.5348,"opt_rev":58.0007,"fo_rev":70.9152,"pn_ratio":0.004120605462727609,"vix":13.655,"cash_traded_value":134135.9,"cash_rev":7.9677,"total_rev":78.8829},{"date":"2026-01-22","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":55025.86,"sf_turnover":384826.03,"io_notional":16995990.09,"io_premium":55061.91,"so_notional":807829.24,"so_premium":8549.46,"io_pcr":1.03,"total_contracts":120098063,"total_turnover":18243671.22,"if_rev":1.9039,"sf_rev":13.315,"fut_rev":15.2189,"io_rev":38.5764,"so_rev":5.9898,"opt_rev":44.5661,"fo_rev":59.785,"pn_ratio":0.0035729058367163294,"vix":13.35,"cash_traded_value":129532.89,"cash_rev":7.6943,"total_rev":67.4793},{"date":"2026-01-23","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":50349.36,"sf_turnover":383005.01,"io_notional":28592644.66,"io_premium":78736.32,"so_notional":878807.56,"so_premium":10038.92,"io_pcr":1.22,"total_contracts":191254050,"total_turnover":29904806.59,"if_rev":1.7421,"sf_rev":13.252,"fut_rev":14.9941,"io_rev":55.1627,"so_rev":7.0333,"opt_rev":62.1959,"fo_rev":77.19,"pn_ratio":0.003012245183484888,"vix":14.1925,"cash_traded_value":119314.12,"cash_rev":7.0873,"total_rev":84.2773},{"date":"2026-01-27","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":63457.7,"sf_turnover":325085.35,"io_notional":81627830.5,"io_premium":110660.63,"so_notional":586430.07,"so_premium":9583.87,"io_pcr":0.91,"total_contracts":507379071,"total_turnover":82602803.62,"if_rev":2.1956,"sf_rev":11.248,"fut_rev":13.4436,"io_rev":77.5288,"so_rev":6.7145,"opt_rev":84.2433,"fo_rev":97.6869,"pn_ratio":0.0014625747305434898,"vix":14.4525,"cash_traded_value":146643.67,"cash_rev":8.7106,"total_rev":106.3975},{"date":"2026-01-28","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":27040.32,"sf_turnover":104694.75,"io_notional":8351009.71,"io_premium":46603.6,"so_notional":438190.84,"so_premium":10723.94,"io_pcr":0.93,"total_contracts":58073929,"total_turnover":8920935.62,"if_rev":0.9356,"sf_rev":3.6224,"fut_rev":4.558,"io_rev":32.6505,"so_rev":7.5132,"opt_rev":40.1637,"fo_rev":44.7217,"pn_ratio":0.006522497657651013,"vix":13.525,"cash_traded_value":139330.51,"cash_rev":8.2762,"total_rev":52.9979},{"date":"2026-01-29","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":31292.19,"sf_turnover":109407.26,"io_notional":8012195.78,"io_premium":40028.43,"so_notional":408172.21,"so_premium":9652.88,"io_pcr":0.88,"total_contracts":55640071,"total_turnover":8561067.44,"if_rev":1.0827,"sf_rev":3.7855,"fut_rev":4.8682,"io_rev":28.0439,"so_rev":6.7628,"opt_rev":34.8067,"fo_rev":39.6749,"pn_ratio":0.005900135250502276,"vix":13.37,"cash_traded_value":154577.42,"cash_rev":9.1819,"total_rev":48.8568},{"date":"2026-01-30","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 January","fy":"FY 2026","if_turnover":25506.63,"sf_turnover":106943.06,"io_notional":13172378.96,"io_premium":65078.85,"so_notional":445406.27,"so_premium":10533.8,"io_pcr":0.95,"total_contracts":87299510,"total_turnover":13750234.92,"if_rev":0.8825,"sf_rev":3.7002,"fut_rev":4.5828,"io_rev":45.5942,"so_rev":7.38,"opt_rev":52.9742,"fo_rev":57.557,"pn_ratio":0.005552492473844074,"vix":13.6325,"cash_traded_value":172680.25,"cash_rev":10.2572,"total_rev":67.8142},{"date":"2026-02-01","day":"Sunday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":53705.68,"sf_turnover":117263.55,"io_notional":32367838.13,"io_premium":111933,"so_notional":591711,"so_premium":13374.34,"io_pcr":0.95,"total_contracts":206947954,"total_turnover":33130518.36,"if_rev":1.8582,"sf_rev":4.0573,"fut_rev":5.9155,"io_rev":78.4203,"so_rev":9.3701,"opt_rev":87.7903,"fo_rev":93.7059,"pn_ratio":0.00380185237078818,"vix":15.095,"cash_traded_value":116984.25,"cash_rev":6.9489,"total_rev":100.6548},{"date":"2026-02-02","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":34761.66,"sf_turnover":111087.71,"io_notional":36146822.92,"io_premium":93742.85,"so_notional":487488.62,"so_premium":9321.52,"io_pcr":0.85,"total_contracts":231247513,"total_turnover":36780160.91,"if_rev":1.2028,"sf_rev":3.8436,"fut_rev":5.0464,"io_rev":65.6762,"so_rev":6.5307,"opt_rev":72.2069,"fo_rev":77.2533,"pn_ratio":0.0028133289713242423,"vix":13.865,"cash_traded_value":129022.57,"cash_rev":7.6639,"total_rev":84.9172},{"date":"2026-02-03","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":69082.32,"sf_turnover":150602.39,"io_notional":70036052.5,"io_premium":118826.57,"so_notional":602998.22,"so_premium":11906.89,"io_pcr":0.97,"total_contracts":429163017,"total_turnover":70858735.43,"if_rev":2.3902,"sf_rev":5.2108,"fut_rev":7.6011,"io_rev":83.2499,"so_rev":8.342,"opt_rev":91.5919,"fo_rev":99.193,"pn_ratio":0.001850725040434122,"vix":12.895,"cash_traded_value":174055.95,"cash_rev":10.3389,"total_rev":109.5319},{"date":"2026-02-04","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":20902.63,"sf_turnover":107413.96,"io_notional":9748144.6,"io_premium":40191.13,"so_notional":565762.88,"so_premium":10687.03,"io_pcr":0.92,"total_contracts":68019176,"total_turnover":10442224.07,"if_rev":0.7232,"sf_rev":3.7165,"fut_rev":4.4398,"io_rev":28.1579,"so_rev":7.4873,"opt_rev":35.6452,"fo_rev":40.085,"pn_ratio":0.0049329664919584865,"vix":12.2525,"cash_traded_value":135526.9,"cash_rev":8.0503,"total_rev":48.1353},{"date":"2026-02-05","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":16870.36,"sf_turnover":84114.9,"io_notional":8943685.55,"io_premium":32154.33,"so_notional":436653.67,"so_premium":8317.95,"io_pcr":1.02,"total_contracts":61114445,"total_turnover":9481324.48,"if_rev":0.5837,"sf_rev":2.9104,"fut_rev":3.4941,"io_rev":22.5273,"so_rev":5.8276,"opt_rev":28.3549,"fo_rev":31.849,"pn_ratio":0.004314585970804582,"vix":12.1675,"cash_traded_value":114315.54,"cash_rev":6.7903,"total_rev":38.6393},{"date":"2026-02-06","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":20802.9,"sf_turnover":86737.33,"io_notional":21036882.78,"io_premium":60865.51,"so_notional":504532.27,"so_premium":8480.38,"io_pcr":0.95,"total_contracts":134791062,"total_turnover":21648955.28,"if_rev":0.7198,"sf_rev":3.0011,"fut_rev":3.7209,"io_rev":42.6424,"so_rev":5.9414,"opt_rev":48.5837,"fo_rev":52.3046,"pn_ratio":0.0032191891683550286,"vix":11.94,"cash_traded_value":108655.63,"cash_rev":6.4541,"total_rev":58.7587},{"date":"2026-02-09","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":18508.14,"sf_turnover":89893.5,"io_notional":21663986.25,"io_premium":45572,"so_notional":559563.99,"so_premium":9445.07,"io_pcr":0.93,"total_contracts":138274842,"total_turnover":22331951.88,"if_rev":0.6404,"sf_rev":3.1103,"fut_rev":3.7507,"io_rev":31.9277,"so_rev":6.6172,"opt_rev":38.545,"fo_rev":42.2957,"pn_ratio":0.002475620204956056,"vix":12.19,"cash_traded_value":114972.5,"cash_rev":6.8294,"total_rev":49.1251},{"date":"2026-02-10","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":15227.16,"sf_turnover":86153.57,"io_notional":59261685.51,"io_premium":56655.15,"so_notional":578207.69,"so_premium":9779.33,"io_pcr":1.05,"total_contracts":360754159,"total_turnover":59941273.93,"if_rev":0.5269,"sf_rev":2.9809,"fut_rev":3.5078,"io_rev":39.6926,"so_rev":6.8514,"opt_rev":46.544,"fo_rev":50.0518,"pn_ratio":0.0011102038531044705,"vix":11.665,"cash_traded_value":118063.85,"cash_rev":7.013,"total_rev":57.0648},{"date":"2026-02-11","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":13883.86,"sf_turnover":95597.29,"io_notional":9080966.51,"io_premium":29929.47,"so_notional":697262.85,"so_premium":10526.16,"io_pcr":1.07,"total_contracts":64385317,"total_turnover":9887710.51,"if_rev":0.4804,"sf_rev":3.3077,"fut_rev":3.788,"io_rev":20.9686,"so_rev":7.3746,"opt_rev":28.3432,"fo_rev":32.1313,"pn_ratio":0.004137316533552861,"vix":11.5475,"cash_traded_value":112625.73,"cash_rev":6.69,"total_rev":38.8213},{"date":"2026-02-12","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":16253.79,"sf_turnover":98741.59,"io_notional":9051205.74,"io_premium":26991.55,"so_notional":696983.6,"so_premium":10256.34,"io_pcr":1.09,"total_contracts":64756249,"total_turnover":9863184.72,"if_rev":0.5624,"sf_rev":3.4165,"fut_rev":3.9788,"io_rev":18.9103,"so_rev":7.1856,"opt_rev":26.0959,"fo_rev":30.0747,"pn_ratio":0.0038210060043827585,"vix":11.725,"cash_traded_value":119233.39,"cash_rev":7.0825,"total_rev":37.1572},{"date":"2026-02-13","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":23987.08,"sf_turnover":105513.61,"io_notional":17914436.08,"io_premium":49593.77,"so_notional":759340.17,"so_premium":11035.6,"io_pcr":1.12,"total_contracts":119798875,"total_turnover":18803276.94,"if_rev":0.83,"sf_rev":3.6508,"fut_rev":4.4807,"io_rev":34.7454,"so_rev":7.7315,"opt_rev":42.4769,"fo_rev":46.9577,"pn_ratio":0.003246765367021038,"vix":13.2925,"cash_traded_value":123599.44,"cash_rev":7.3418,"total_rev":54.2995},{"date":"2026-02-16","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":20309.95,"sf_turnover":82461.95,"io_notional":26515027.41,"io_premium":58720.69,"so_notional":644080.68,"so_premium":8234.55,"io_pcr":0.82,"total_contracts":169286947,"total_turnover":27261879.99,"if_rev":0.7027,"sf_rev":2.8532,"fut_rev":3.5559,"io_rev":41.1397,"so_rev":5.7691,"opt_rev":46.9088,"fo_rev":50.4647,"pn_ratio":0.0024652959801965283,"vix":13.33,"cash_traded_value":89436.36,"cash_rev":5.3125,"total_rev":55.7772},{"date":"2026-02-17","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":18098.41,"sf_turnover":103106.47,"io_notional":70617765,"io_premium":74624.53,"so_notional":664653.04,"so_premium":7998.08,"io_pcr":0.95,"total_contracts":433380726,"total_turnover":71403622.92,"if_rev":0.6262,"sf_rev":3.5675,"fut_rev":4.1937,"io_rev":52.2819,"so_rev":5.6035,"opt_rev":57.8854,"fo_rev":62.0791,"pn_ratio":0.00115908820536414,"vix":12.6725,"cash_traded_value":95690.63,"cash_rev":5.684,"total_rev":67.7631},{"date":"2026-02-18","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":19105.91,"sf_turnover":140226.01,"io_notional":10944075.71,"io_premium":37895.94,"so_notional":720340.54,"so_premium":7532.39,"io_pcr":0.87,"total_contracts":77148018,"total_turnover":11823748.17,"if_rev":0.6611,"sf_rev":4.8518,"fut_rev":5.5129,"io_rev":26.5499,"so_rev":5.2772,"opt_rev":31.8271,"fo_rev":37.34,"pn_ratio":0.0038946080992265687,"vix":12.2225,"cash_traded_value":92768.41,"cash_rev":5.5104,"total_rev":42.8504},{"date":"2026-02-19","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":35724.72,"sf_turnover":322861.27,"io_notional":13428775.73,"io_premium":44057.4,"so_notional":766769.78,"so_premium":6646.56,"io_pcr":1.08,"total_contracts":95507372,"total_turnover":14554131.5,"if_rev":1.2361,"sf_rev":11.171,"fut_rev":12.4071,"io_rev":30.8666,"so_rev":4.6566,"opt_rev":35.5232,"fo_rev":47.9303,"pn_ratio":0.003571821876396492,"vix":13.46,"cash_traded_value":93811.52,"cash_rev":5.5724,"total_rev":53.5027},{"date":"2026-02-20","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":44485.49,"sf_turnover":347995.23,"io_notional":23362393.71,"io_premium":78240.91,"so_notional":774707.3,"so_premium":7218.39,"io_pcr":0.83,"total_contracts":155541571,"total_turnover":24529581.73,"if_rev":1.5392,"sf_rev":12.0406,"fut_rev":13.5798,"io_rev":54.8156,"so_rev":5.0572,"opt_rev":59.8728,"fo_rev":73.4526,"pn_ratio":0.003540578463196314,"vix":14.3625,"cash_traded_value":92643.79,"cash_rev":5.503,"total_rev":78.9556},{"date":"2026-02-23","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":49422.81,"sf_turnover":326641.32,"io_notional":30096203.05,"io_premium":75549.88,"so_notional":753104.79,"so_premium":7416.95,"io_pcr":0.99,"total_contracts":194238576,"total_turnover":31225371.97,"if_rev":1.71,"sf_rev":11.3018,"fut_rev":13.0118,"io_rev":52.9302,"so_rev":5.1963,"opt_rev":58.1266,"fo_rev":71.1384,"pn_ratio":0.0026894227394114525,"vix":14.1675,"cash_traded_value":101052.48,"cash_rev":6.0025,"total_rev":77.1409},{"date":"2026-02-24","day":"Tuesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":49399.34,"sf_turnover":249370.1,"io_notional":78118228.69,"io_premium":94539.55,"so_notional":515292.98,"so_premium":7481.46,"io_pcr":1.11,"total_contracts":474650140,"total_turnover":78932291.11,"if_rev":1.7092,"sf_rev":8.6282,"fut_rev":10.3374,"io_rev":66.2344,"so_rev":5.2415,"opt_rev":71.4759,"fo_rev":81.8133,"pn_ratio":0.0012974238954748826,"vix":14.15,"cash_traded_value":113004.6,"cash_rev":6.7125,"total_rev":88.5258},{"date":"2026-02-25","day":"Wednesday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":22287.35,"sf_turnover":86906.43,"io_notional":11723257.95,"io_premium":46575.46,"so_notional":375205.39,"so_premium":8430.6,"io_pcr":1,"total_contracts":76865266,"total_turnover":12207657.12,"if_rev":0.7711,"sf_rev":3.007,"fut_rev":3.7781,"io_rev":32.6308,"so_rev":5.9065,"opt_rev":38.5372,"fo_rev":42.3154,"pn_ratio":0.004546532766532316,"vix":13.4875,"cash_traded_value":108503.78,"cash_rev":6.4451,"total_rev":48.7605},{"date":"2026-02-26","day":"Thursday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":14974.94,"sf_turnover":82255.43,"io_notional":11929791.91,"io_premium":40495.09,"so_notional":315208.3,"so_premium":6831.99,"io_pcr":1.03,"total_contracts":77243618,"total_turnover":12342230.58,"if_rev":0.5181,"sf_rev":2.846,"fut_rev":3.3642,"io_rev":28.3709,"so_rev":4.7865,"opt_rev":33.1574,"fo_rev":36.5215,"pn_ratio":0.0038650125919434336,"vix":13.0625,"cash_traded_value":108665.76,"cash_rev":6.4547,"total_rev":42.9762},{"date":"2026-02-27","day":"Friday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 February","fy":"FY 2026","if_turnover":27143.92,"sf_turnover":84329.03,"io_notional":23012562.96,"io_premium":66814.4,"so_notional":303361.79,"so_premium":6292.6,"io_pcr":1.14,"total_contracts":144676358,"total_turnover":23427397.7,"if_rev":0.9392,"sf_rev":2.9178,"fut_rev":3.857,"io_rev":46.8102,"so_rev":4.4086,"opt_rev":51.2188,"fo_rev":55.0757,"pn_ratio":0.003135496480790452,"vix":13.7025,"cash_traded_value":144962.74,"cash_rev":8.6108,"total_rev":63.6865},{"date":"2026-03-02","day":"Monday","fy_quarter":"Q4 FY 2026","fy_month":"FY 2026 March","fy":"FY 2026","if_turnover":37391.24,"sf_turnover":98324.12,"io_notional":76460181.64,"io_premium":116117.42,"so_notional":404402.98,"so_premium":8146.9,"io_pcr":1.08,"total_contracts":480294001,"total_turnover":77000299.98,"if_rev":1.2937,"sf_rev":3.402,"fut_rev":4.6958,"io_rev":81.3519,"so_rev":5.7077,"opt_rev":87.0596,"fo_rev":91.7553,"pn_ratio":0.0016166654723281581,"vix":17.13,"cash_traded_value":135372.72,"cash_rev":8.0411,"total_rev":99.7964}],"monthly":[{"month":"Apr-23","trading_days":17,"futures_turnover":1757367.2999999998,"futures_adto":103374.54705882352,"options_notional":409990962.2,"premium_turnover":895221.2899999999,"options_adto":52660.07588235294,"total_turnover":411748329.5,"futures_rev":60.80490858,"options_rev":627.1920357739999,"fo_rev":687.9969443539999,"cash_rev":52.23271343400001,"total_rev":740.2296577879999},{"month":"May-23","trading_days":22,"futures_turnover":2298207.6799999997,"futures_adto":104463.98545454544,"options_notional":552510792.88,"premium_turnover":1260198.3599999999,"options_adto":57281.74363636363,"total_turnover":554809000.5600001,"futures_rev":79.517985728,"options_rev":882.8949710160001,"fo_rev":962.4129567440001,"cash_rev":78.493650642,"total_rev":1040.9066073860001},{"month":"Jun-23","trading_days":21,"futures_turnover":2188016.74,"futures_adto":104191.27333333335,"options_notional":540003631.7099999,"premium_turnover":1098515.69,"options_adto":52310.270952380946,"total_turnover":542191648.45,"futures_rev":75.705379204,"options_rev":769.620092414,"fo_rev":845.325471618,"cash_rev":77.75552782800001,"total_rev":923.0809994460001},{"month":"Jul-23","trading_days":21,"futures_turnover":2585085.59,"futures_adto":123099.3138095238,"options_notional":633779990.21,"premium_turnover":1396220.8,"options_adto":66486.70476190477,"total_turnover":636365075.8,"futures_rev":89.44396141400003,"options_rev":978.19229248,"fo_rev":1067.636253894,"cash_rev":90.670037634,"total_rev":1158.306291528},{"month":"Aug-23","trading_days":22,"futures_turnover":2583623.71,"futures_adto":117437.44136363636,"options_notional":665021870.0600001,"premium_turnover":1267906.0399999996,"options_adto":57632.092727272706,"total_turnover":667605493.77,"futures_rev":89.39338036599999,"options_rev":888.2949716240001,"fo_rev":977.6883519900001,"cash_rev":83.325750948,"total_rev":1061.0141029380002},{"month":"Sep-23","trading_days":20,"futures_turnover":2589944.3400000003,"futures_adto":129497.21700000002,"options_notional":660059770.77,"premium_turnover":1210541.94,"options_adto":60527.096999999994,"total_turnover":662649715.1100001,"futures_rev":89.61207416399999,"options_rev":848.1056831639999,"fo_rev":937.7177573279998,"cash_rev":99.24591798,"total_rev":1036.963675308},{"month":"Oct-23","trading_days":20,"futures_turnover":2398282.71,"futures_adto":119914.1355,"options_notional":635338520.7299998,"premium_turnover":1064059.91,"options_adto":53202.9955,"total_turnover":637736803.4399998,"futures_rev":82.98058176600001,"options_rev":745.480372946,"fo_rev":828.460954712,"cash_rev":79.80502622399999,"total_rev":908.265980936},{"month":"Nov-23","trading_days":21,"futures_turnover":2404714.02,"futures_adto":114510.19142857143,"options_notional":652201797.92,"premium_turnover":978201.4199999999,"options_adto":46581.02,"total_turnover":654606511.94,"futures_rev":83.20310509199999,"options_rev":685.3279148520002,"fo_rev":768.5310199440001,"cash_rev":88.08462887399999,"total_rev":856.6156488180002},{"month":"Dec-23","trading_days":20,"futures_turnover":3188630.8200000003,"futures_adto":159431.54100000003,"options_notional":754605864.07,"premium_turnover":1416841.3399999999,"options_adto":70842.067,"total_turnover":757794494.89,"futures_rev":110.32662637199998,"options_rev":992.6390428040002,"fo_rev":1102.9656691760001,"cash_rev":123.52789666800001,"total_rev":1226.4935658440002},{"month":"Jan-24","trading_days":22,"futures_turnover":3789859.3999999994,"futures_adto":172266.33636363634,"options_notional":882177774.0400001,"premium_turnover":1677879.5,"options_adto":76267.25,"total_turnover":885967633.44,"futures_rev":131.12913524,"options_rev":1175.5223777000003,"fo_rev":1306.6515129400004,"cash_rev":147.97614070799997,"total_rev":1454.6276536480004},{"month":"Feb-24","trading_days":21,"futures_turnover":3809270.45,"futures_adto":181393.83095238096,"options_notional":855646104.39,"premium_turnover":1677660.1399999997,"options_adto":79888.57809523807,"total_turnover":859455374.8400002,"futures_rev":131.80075757,"options_rev":1175.368694084,"fo_rev":1307.169451654,"cash_rev":145.985670468,"total_rev":1453.1551221220002},{"month":"Mar-24","trading_days":19,"futures_turnover":3371080.9899999998,"futures_adto":177425.31526315789,"options_notional":718465989.6999998,"premium_turnover":1254347.96,"options_adto":66018.31368421053,"total_turnover":721837070.6899998,"futures_rev":116.639402254,"options_rev":878.796180776,"fo_rev":995.4355830300001,"cash_rev":110.30811363,"total_rev":1105.74369666},{"month":"Apr-24","trading_days":20,"futures_turnover":3851978.8899999997,"futures_adto":192598.94449999998,"options_notional":717158708.67,"premium_turnover":1240544.96,"options_adto":62027.248,"total_turnover":721010687.5600001,"futures_rev":133.278469594,"options_rev":869.125798976,"fo_rev":1002.4042685700001,"cash_rev":125.93961388800003,"total_rev":1128.343882458},{"month":"May-24","trading_days":22,"futures_turnover":4271082.2,"futures_adto":194140.1,"options_notional":726391203.4500002,"premium_turnover":1471401.3199999998,"options_adto":66881.87818181817,"total_turnover":730662285.6499999,"futures_rev":147.77944412000002,"options_rev":1030.8637647919998,"fo_rev":1178.6432089119999,"cash_rev":146.595721536,"total_rev":1325.2389304479998},{"month":"Jun-24","trading_days":19,"futures_turnover":4645872.859999999,"futures_adto":244519.6242105263,"options_notional":733791828.6,"premium_turnover":1677677.6600000001,"options_adto":88298.82421052632,"total_turnover":738437701.4599999,"futures_rev":160.747200956,"options_rev":1175.3809685959998,"fo_rev":1336.1281695519997,"cash_rev":172.57045172399995,"total_rev":1508.6986212759996},{"month":"Jul-24","trading_days":22,"futures_turnover":4656834.51,"futures_adto":211674.2959090909,"options_notional":833414835.6800002,"premium_turnover":1510073.4100000001,"options_adto":68639.70045454545,"total_turnover":838071670.19,"futures_rev":161.126474046,"options_rev":1057.957431046,"fo_rev":1219.083905092,"cash_rev":181.85765716799995,"total_rev":1400.94156226},{"month":"Aug-24","trading_days":21,"futures_turnover":4119112.2300000004,"futures_adto":196148.20142857145,"options_notional":788448211.7500001,"premium_turnover":1380676.39,"options_adto":65746.49476190476,"total_turnover":792567323.9800001,"futures_rev":142.521283158,"options_rev":967.3018788339998,"fo_rev":1109.8231619919998,"cash_rev":156.706525206,"total_rev":1266.5296871979997},{"month":"Sep-24","trading_days":21,"futures_turnover":4127438.4099999997,"futures_adto":196544.68619047618,"options_notional":822632184.3599999,"premium_turnover":1311065.8600000003,"options_adto":62431.70761904764,"total_turnover":826759622.7700001,"futures_rev":142.80936898599998,"options_rev":918.5327415159999,"fo_rev":1061.3421105019997,"cash_rev":152.026936776,"total_rev":1213.3690472779997},{"month":"Oct-24","trading_days":22,"futures_turnover":4104370.8200000003,"futures_adto":186562.31000000003,"options_notional":872627625.18,"premium_turnover":1539424.7499999995,"options_adto":69973.85227272725,"total_turnover":876731996.0000001,"futures_rev":142.011230372,"options_rev":1078.5209798500002,"fo_rev":1220.5322102220002,"cash_rev":139.774041396,"total_rev":1360.3062516180003},{"month":"Nov-24","trading_days":19,"futures_turnover":3250775.0300000003,"futures_adto":171093.42263157896,"options_notional":633537761.33,"premium_turnover":1158998.36,"options_adto":60999.91368421053,"total_turnover":636788536.36,"futures_rev":112.476816038,"options_rev":811.9942510160002,"fo_rev":924.4710670540003,"cash_rev":113.822857368,"total_rev":1038.2939244220004},{"month":"Dec-24","trading_days":21,"futures_turnover":3298012.5499999993,"futures_adto":157048.21666666665,"options_notional":436179020.22999996,"premium_turnover":1101865.94,"options_adto":52469.806666666664,"total_turnover":439477032.78000003,"futures_rev":114.11123422999998,"options_rev":771.9672775639998,"fo_rev":886.0785117939997,"cash_rev":129.83828714999999,"total_rev":1015.9167989439998},{"month":"Jan-25","trading_days":23,"futures_turnover":3794473.22,"futures_adto":164977.09652173915,"options_notional":437791542.18999994,"premium_turnover":1230482.47,"options_adto":53499.23782608695,"total_turnover":441586015.41,"futures_rev":131.28877341199998,"options_rev":862.0760184820001,"fo_rev":993.3647918940001,"cash_rev":131.38394643,"total_rev":1124.748738324},{"month":"Feb-25","trading_days":20,"futures_turnover":3192702.8,"futures_adto":159635.13999999998,"options_notional":365755362.97999996,"premium_turnover":958054.2,"options_adto":47902.71,"total_turnover":368948065.78000003,"futures_rev":110.46751688,"options_rev":671.21277252,"fo_rev":781.6802894,"cash_rev":108.89363568600002,"total_rev":890.573925086},{"month":"Mar-25","trading_days":19,"futures_turnover":2976805.3199999994,"futures_adto":156673.9642105263,"options_notional":421943996.5799999,"premium_turnover":969450.9400000002,"options_adto":51023.733684210536,"total_turnover":424920801.9,"futures_rev":102.99746407200001,"options_rev":679.1973285640001,"fo_rev":782.1947926360001,"cash_rev":111.38450994000002,"total_rev":893.5793025760001},{"month":"Apr-25","trading_days":19,"futures_turnover":3376874.889999999,"futures_adto":177730.257368421,"options_notional":432876410.62,"premium_turnover":1104894.7,"options_adto":58152.35263157894,"total_turnover":436253285.51,"futures_rev":116.839871194,"options_rev":774.08922682,"fo_rev":890.929098014,"cash_rev":113.23168243199999,"total_rev":1004.160780446},{"month":"May-25","trading_days":21,"futures_turnover":3533762.6099999994,"futures_adto":168274.40999999997,"options_notional":460618893.84999996,"premium_turnover":1251392.2799999998,"options_adto":59590.10857142856,"total_turnover":464152656.46,"futures_rev":122.268186306,"options_rev":876.7254313680002,"fo_rev":998.9936176740001,"cash_rev":138.554532666,"total_rev":1137.5481503400001},{"month":"Jun-25","trading_days":21,"futures_turnover":3363570.3700000006,"futures_adto":160170.01761904763,"options_notional":453920726.77,"premium_turnover":1030043.1499999999,"options_adto":49049.6738095238,"total_turnover":457284297.14000005,"futures_rev":116.37953480199998,"options_rev":721.6482308899999,"fo_rev":838.0277656919999,"cash_rev":142.36941331799997,"total_rev":980.3971790099998},{"month":"Jul-25","trading_days":23,"futures_turnover":3203155.44,"futures_adto":139267.62782608694,"options_notional":524533026.34000003,"premium_turnover":1002316.92,"options_adto":43578.99652173913,"total_turnover":527736181.7800001,"futures_rev":110.82917822400002,"options_rev":702.223234152,"fo_rev":813.052412376,"cash_rev":129.782743398,"total_rev":942.835155774},{"month":"Aug-25","trading_days":19,"futures_turnover":2799848.38,"futures_adto":147360.44105263156,"options_notional":447369681.67000014,"premium_turnover":899403.5099999999,"options_adto":47337.02684210526,"total_turnover":450169530.05,"futures_rev":96.874753948,"options_rev":630.1220991060001,"fo_rev":726.9968530540001,"cash_rev":105.575299236,"total_rev":832.5721522900001},{"month":"Sep-25","trading_days":22,"futures_turnover":3023701.25,"futures_adto":137440.9659090909,"options_notional":591192875.5000001,"premium_turnover":1070553.2,"options_adto":48661.50909090909,"total_turnover":594216576.7499999,"futures_rev":104.62006325,"options_rev":750.02957192,"fo_rev":854.64963517,"cash_rev":128.474755992,"total_rev":983.124391162},{"month":"Oct-25","trading_days":21,"futures_turnover":3298841.73,"futures_adto":157087.70142857142,"options_notional":595843087.6899999,"premium_turnover":1184489.37,"options_adto":56404.25571428572,"total_turnover":599141929.42,"futures_rev":114.139923858,"options_rev":829.853252622,"fo_rev":943.99317648,"cash_rev":123.16819640399996,"total_rev":1067.161372884},{"month":"Nov-25","trading_days":19,"futures_turnover":3018725.92,"futures_adto":158880.31157894735,"options_notional":513822000.65999997,"premium_turnover":1036901.5,"options_adto":54573.76315789474,"total_turnover":516840726.58000004,"futures_rev":104.447916832,"options_rev":726.4531909000001,"fo_rev":830.9011077320001,"cash_rev":118.02499632,"total_rev":948.9261040520001},{"month":"Dec-25","trading_days":22,"futures_turnover":3090548.02,"futures_adto":140479.45545454544,"options_notional":594044964.1000001,"premium_turnover":1079964.95,"options_adto":49089.31590909091,"total_turnover":597135512.12,"futures_rev":106.93296149199999,"options_rev":756.62344397,"fo_rev":863.556405462,"cash_rev":123.44808564000003,"total_rev":987.0044911020001},{"month":"Jan-26","trading_days":20,"futures_turnover":3613048.9299999997,"futures_adto":180652.4465,"options_notional":607899592.4,"premium_turnover":1329253.88,"options_adto":66462.69399999999,"total_turnover":611512641.3299999,"futures_rev":125.011492978,"options_rev":931.275268328,"fo_rev":1056.286761306,"cash_rev":142.03710655199998,"total_rev":1198.323867858},{"month":"Feb-26","trading_days":21,"futures_turnover":3564211.06,"futures_adto":169724.3361904762,"options_notional":607313018.24,"premium_turnover":1471183.3599999999,"options_adto":70056.35047619048,"total_turnover":610877229.3000002,"futures_rev":123.321702676,"options_rev":1030.7110620160001,"fo_rev":1154.0327646920002,"cash_rev":143.01119170799998,"total_rev":1297.0439564000003},{"month":"Mar-26","trading_days":1,"futures_turnover":135715.36,"futures_adto":135715.36,"options_notional":76864584.62,"premium_turnover":124264.31999999999,"options_adto":124264.31999999999,"total_turnover":77000299.98,"futures_rev":4.695751456,"options_rev":87.059582592,"fo_rev":91.755334048,"cash_rev":8.041139568,"total_rev":99.796473616}],"quarterly":[{"quarter":"Q1 FY 2024","days":60,"opt_rev":2279.71,"fut_rev":216.03,"cash_rev":208.48,"total_rev":2704.22,"io_rev":2122.93,"so_rev":156.77,"if_rev":55.62,"sf_rev":160.41},{"quarter":"Q2 FY 2024","days":63,"opt_rev":2714.59,"fut_rev":268.45,"cash_rev":268.34,"total_rev":3251.39,"io_rev":2489.81,"so_rev":224.78,"if_rev":60.53,"sf_rev":207.91},{"quarter":"Q3 FY 2024","days":61,"opt_rev":2423.45,"fut_rev":276.51,"cash_rev":291.42,"total_rev":2991.38,"io_rev":2173.27,"so_rev":250.17,"if_rev":56.97,"sf_rev":219.55},{"quarter":"Q4 FY 2024","days":62,"opt_rev":3229.69,"fut_rev":379.57,"cash_rev":404.27,"total_rev":4013.53,"io_rev":2895.97,"so_rev":333.72,"if_rev":83.51,"sf_rev":296.06},{"quarter":"Q1 FY 2025","days":61,"opt_rev":3075.37,"fut_rev":441.81,"cash_rev":445.11,"total_rev":3962.28,"io_rev":2701.3,"so_rev":374.07,"if_rev":85.91,"sf_rev":355.89},{"quarter":"Q2 FY 2025","days":64,"opt_rev":2943.79,"fut_rev":446.46,"cash_rev":490.59,"total_rev":3880.84,"io_rev":2569.48,"so_rev":374.31,"if_rev":79.26,"sf_rev":367.2},{"quarter":"Q3 FY 2025","days":62,"opt_rev":2662.48,"fut_rev":368.6,"cash_rev":383.43,"total_rev":3414.52,"io_rev":2353.35,"so_rev":309.13,"if_rev":70.2,"sf_rev":298.39},{"quarter":"Q4 FY 2025","days":62,"opt_rev":2212.49,"fut_rev":344.75,"cash_rev":351.66,"total_rev":2908.9,"io_rev":1886.17,"so_rev":326.31,"if_rev":67.45,"sf_rev":277.31},{"quarter":"Q1 FY 2026","days":61,"opt_rev":2372.46,"fut_rev":355.49,"cash_rev":394.16,"total_rev":3122.11,"io_rev":2044.36,"so_rev":328.1,"if_rev":75.49,"sf_rev":280.0},{"quarter":"Q2 FY 2026","days":64,"opt_rev":2082.37,"fut_rev":312.32,"cash_rev":363.83,"total_rev":2758.53,"io_rev":1810.04,"so_rev":272.34,"if_rev":53.75,"sf_rev":258.57},{"quarter":"Q3 FY 2026","days":62,"opt_rev":2312.93,"fut_rev":325.52,"cash_rev":364.64,"total_rev":3003.09,"io_rev":2033.14,"so_rev":279.79,"if_rev":56.63,"sf_rev":268.89},{"quarter":"Q4 FY 2026","days":42,"opt_rev":2049.05,"fut_rev":253.03,"cash_rev":293.09,"total_rev":2595.16,"io_rev":1788.8,"so_rev":260.25,"if_rev":42.38,"sf_rev":210.65}],"weekly":[{"week":"2025-11-17","total_rev":250.73270000000002,"opt_rev":183.3427,"fut_rev":37.5627,"cash_rev":29.827099999999994,"days":5},{"week":"2025-11-24","total_rev":246.17060000000004,"opt_rev":184.1648,"fut_rev":32.065000000000005,"cash_rev":29.940800000000003,"days":5},{"week":"2025-12-01","total_rev":220.7288,"opt_rev":178.09159999999997,"fut_rev":15.756899999999998,"cash_rev":26.880200000000002,"days":5},{"week":"2025-12-08","total_rev":251.5262,"opt_rev":206.9093,"fut_rev":17.03,"cash_rev":27.586699999999997,"days":5},{"week":"2025-12-15","total_rev":206.7784,"opt_rev":162.5402,"fut_rev":16.8861,"cash_rev":27.3521,"days":5},{"week":"2025-12-22","total_rev":161.166,"opt_rev":107.9066,"fut_rev":32.2074,"cash_rev":21.0519,"days":4},{"week":"2025-12-29","total_rev":209.5214,"opt_rev":147.0567,"fut_rev":31.037000000000003,"cash_rev":31.4278,"days":5},{"week":"2026-01-05","total_rev":242.3922,"opt_rev":190.07059999999998,"fut_rev":20.47,"cash_rev":31.851599999999998,"days":5},{"week":"2026-01-12","total_rev":253.5539,"opt_rev":210.3836,"fut_rev":17.0382,"cash_rev":26.1321,"days":4},{"week":"2026-01-19","total_rev":363.59529999999995,"opt_rev":272.75190000000003,"fut_rev":54.0663,"cash_rev":36.777,"days":5},{"week":"2026-01-26","total_rev":376.72119999999995,"opt_rev":299.9782,"fut_rev":33.3681,"cash_rev":43.3748,"days":5},{"week":"2026-02-02","total_rev":339.9824,"opt_rev":276.3826,"fut_rev":24.3023,"cash_rev":39.2975,"days":5},{"week":"2026-02-09","total_rev":236.46790000000001,"opt_rev":182.005,"fut_rev":19.506,"cash_rev":34.9567,"days":5},{"week":"2026-02-16","total_rev":298.84900000000005,"opt_rev":232.01729999999998,"fut_rev":39.2494,"cash_rev":27.582300000000004,"days":5},{"week":"2026-02-23","total_rev":321.0899,"opt_rev":252.5159,"fut_rev":34.3485,"cash_rev":34.2256,"days":5}],"dow_avg":{"Friday":{"avg_total":50.82,"avg_options":38.72,"avg_futures":5.54,"avg_cash":6.57,"count":41},"Monday":{"avg_total":50.09,"avg_options":38.56,"avg_futures":5.57,"avg_cash":5.96,"count":41},"Tuesday":{"avg_total":55.08,"avg_options":43.24,"avg_futures":5.61,"avg_cash":6.22,"count":41},"Wednesday":{"avg_total":42.92,"avg_options":32.14,"avg_futures":4.69,"avg_cash":6.09,"count":38},"Thursday":{"avg_total":47.25,"avg_options":35.51,"avg_futures":5.62,"avg_cash":6.13,"count":38},"Sunday":{"avg_total":100.65,"avg_options":87.79,"avg_futures":5.92,"avg_cash":6.95,"count":1}},"pnl":[{"quarter":"Q3 FY 2024","trading_days":61,"is_predicted":false,"transaction_rev":2819,"listing_income":62,"data_centre":229,"data_feed":91,"index_licensing":23,"clearing_settlement":46,"operating_investment":215,"other_operating":32,"investment_income":454,"other_non_operating":3,"total_revenue":3974,"employee_cost":117,"regulatory_fees":251,"depreciation":113,"technology_expense":151,"sebi_settlement":0,"csr_expense":0,"other_expense":180,"sgf_contribution":556,"total_expense":1368,"ebitda":2606,"ebitda_margin":0.66,"share_profit_associates":30,"profit_sale_investment":0,"discontinued_operations":-37,"pbt":2599,"income_tax":622,"tax_rate":0.24,"pat":1977,"pat_margin":0.5,"eps":7.99},{"quarter":"Q4 FY 2024","trading_days":62,"is_predicted":false,"transaction_rev":3745,"listing_income":57,"data_centre":243,"data_feed":91,"index_licensing":20,"clearing_settlement":65,"operating_investment":351,"other_operating":53,"investment_income":447,"other_non_operating":8,"total_revenue":5080,"employee_cost":119,"regulatory_fees":302,"depreciation":116,"technology_expense":243,"sebi_settlement":0,"csr_expense":129,"other_expense":222,"sgf_contribution":574,"total_expense":1705,"ebitda":3375,"ebitda_margin":0.66,"share_profit_associates":22,"profit_sale_investment":0,"discontinued_operations":-12,"pbt":3385,"income_tax":897,"tax_rate":0.26,"pat":2488,"pat_margin":0.49,"eps":10.05},{"quarter":"Q1 FY 2025","trading_days":61,"is_predicted":false,"transaction_rev":3653,"listing_income":67,"data_centre":261,"data_feed":100,"index_licensing":27,"clearing_settlement":81,"operating_investment":267,"other_operating":53,"investment_income":436,"other_non_operating":4,"total_revenue":4949,"employee_cost":148,"regulatory_fees":269,"depreciation":126,"technology_expense":215,"sebi_settlement":0,"csr_expense":1,"other_expense":184,"sgf_contribution":587,"total_expense":1530,"ebitda":3419,"ebitda_margin":0.69,"share_profit_associates":25,"profit_sale_investment":0,"discontinued_operations":-29,"pbt":3415,"income_tax":849,"tax_rate":0.25,"pat":2566,"pat_margin":0.52,"eps":10.37},{"quarter":"Q2 FY 2025","trading_days":64,"is_predicted":false,"transaction_rev":3586,"listing_income":80,"data_centre":294,"data_feed":104,"index_licensing":28,"clearing_settlement":101,"operating_investment":259,"other_operating":57,"investment_income":504,"other_non_operating":9,"total_revenue":5022,"employee_cost":194,"regulatory_fees":300,"depreciation":137,"technology_expense":225,"sebi_settlement":670,"csr_expense":1,"other_expense":203,"sgf_contribution":-426,"total_expense":1304,"ebitda":3718,"ebitda_margin":0.74,"share_profit_associates":30,"profit_sale_investment":0,"discontinued_operations":410,"pbt":4158,"income_tax":1023,"tax_rate":0.25,"pat":3135,"pat_margin":0.62,"eps":12.67},{"quarter":"Q3 FY 2025","trading_days":62,"is_predicted":false,"transaction_rev":3445,"listing_income":99,"data_centre":305,"data_feed":103,"index_licensing":32,"clearing_settlement":84,"operating_investment":221,"other_operating":60,"investment_income":447,"other_non_operating":10,"total_revenue":4806,"employee_cost":163,"regulatory_fees":240,"depreciation":132,"technology_expense":270,"sebi_settlement":0,"csr_expense":0,"other_expense":210,"sgf_contribution":68,"total_expense":1083,"ebitda":3723,"ebitda_margin":0.77,"share_profit_associates":37,"profit_sale_investment":1155,"discontinued_operations":18,"pbt":4933,"income_tax":1099,"tax_rate":0.22,"pat":3834,"pat_margin":0.8,"eps":15.49},{"quarter":"Q4 FY 2025","trading_days":62,"is_predicted":false,"transaction_rev":2939,"listing_income":67,"data_centre":296,"data_feed":100,"index_licensing":33,"clearing_settlement":55,"operating_investment":209,"other_operating":72,"investment_income":545,"other_non_operating":81,"total_revenue":4397,"employee_cost":167,"regulatory_fees":154,"depreciation":151,"technology_expense":304,"sebi_settlement":0,"csr_expense":171,"other_expense":172,"sgf_contribution":5,"total_expense":1124,"ebitda":3273,"ebitda_margin":0.74,"share_profit_associates":38,"profit_sale_investment":55,"discontinued_operations":183,"pbt":3549,"income_tax":898,"tax_rate":0.25,"pat":2651,"pat_margin":0.6,"eps":10.71},{"quarter":"Q1 FY 2026","trading_days":61,"is_predicted":false,"transaction_rev":3150,"listing_income":78,"data_centre":306,"data_feed":106,"index_licensing":38,"clearing_settlement":49,"operating_investment":241,"other_operating":64,"investment_income":616,"other_non_operating":150,"total_revenue":4798,"employee_cost":198,"regulatory_fees":170,"depreciation":150,"technology_expense":310,"sebi_settlement":40,"csr_expense":1,"other_expense":185,"sgf_contribution":0,"total_expense":1054,"ebitda":3744,"ebitda_margin":0.78,"share_profit_associates":30,"profit_sale_investment":0,"discontinued_operations":112,"pbt":3886,"income_tax":964,"tax_rate":0.25,"pat":2922,"pat_margin":0.61,"eps":11.81},{"quarter":"Q2 FY 2026","trading_days":64,"is_predicted":false,"transaction_rev":2785,"listing_income":88,"data_centre":312,"data_feed":115,"index_licensing":37,"clearing_settlement":55,"operating_investment":217,"other_operating":67,"investment_income":475,"other_non_operating":9,"total_revenue":4160,"employee_cost":186,"regulatory_fees":195,"depreciation":161,"technology_expense":315,"sebi_settlement":1297,"csr_expense":1,"other_expense":199,"sgf_contribution":0,"total_expense":2354,"ebitda":1806,"ebitda_margin":0.43,"share_profit_associates":30,"profit_sale_investment":1201,"discontinued_operations":3,"pbt":3040,"income_tax":942,"tax_rate":0.31,"pat":2098,"pat_margin":0.5,"eps":8.48},{"quarter":"Q3 FY 2026","trading_days":62,"is_predicted":false,"transaction_rev":3033,"listing_income":111,"data_centre":302,"data_feed":121,"index_licensing":36,"clearing_settlement":68,"operating_investment":185,"other_operating":69,"investment_income":458,"other_non_operating":12,"total_revenue":4395,"employee_cost":192,"regulatory_fees":212,"depreciation":161,"technology_expense":328,"sebi_settlement":10,"csr_expense":5,"other_expense":199,"sgf_contribution":1,"total_expense":1108,"ebitda":3287,"ebitda_margin":0.75,"share_profit_associates":25,"profit_sale_investment":0,"discontinued_operations":0.3,"pbt":3186.3,"income_tax":778,"tax_rate":0.24,"pat":2408.3,"pat_margin":0.55,"eps":9.73},{"quarter":"Q4 FY 2026","trading_days":42,"is_predicted":true,"transaction_rev":3830.96,"listing_income":null,"data_centre":null,"data_feed":null,"index_licensing":null,"clearing_settlement":null,"operating_investment":1805.87,"other_operating":null,"investment_income":null,"other_non_operating":null,"total_revenue":5636.83,"employee_cost":249.14,"regulatory_fees":268.06,"depreciation":212.32,"technology_expense":423.75,"sebi_settlement":0,"csr_expense":38.62,"other_expense":194.89,"sgf_contribution":0,"total_expense":1386.79,"ebitda":4250.03,"ebitda_margin":0.75,"share_profit_associates":29.67,"profit_sale_investment":0,"discontinued_operations":0,"pbt":4279.7,"income_tax":1082.71,"tax_rate":0.25,"pat":3196.99,"pat_margin":0.57,"eps":12.92},{"quarter":"Q1 FY 2027","trading_days":61,"is_predicted":true,"transaction_rev":3050,"listing_income":null,"data_centre":null,"data_feed":null,"index_licensing":null,"clearing_settlement":null,"operating_investment":1437.73,"other_operating":null,"investment_income":null,"other_non_operating":null,"total_revenue":4487.73,"employee_cost":198.35,"regulatory_fees":213.42,"depreciation":169.04,"technology_expense":337.37,"sebi_settlement":0,"csr_expense":38.62,"other_expense":194.89,"sgf_contribution":0,"total_expense":1151.69,"ebitda":3336.04,"ebitda_margin":0.74,"share_profit_associates":29.67,"profit_sale_investment":0,"discontinued_operations":0,"pbt":3365.71,"income_tax":851.48,"tax_rate":0.25,"pat":2514.23,"pat_margin":0.56,"eps":10.16},{"quarter":"Q2 FY 2027","trading_days":64,"is_predicted":true,"transaction_rev":3840,"listing_income":null,"data_centre":null,"data_feed":null,"index_licensing":null,"clearing_settlement":null,"operating_investment":1810.13,"other_operating":null,"investment_income":null,"other_non_operating":null,"total_revenue":5650.13,"employee_cost":249.73,"regulatory_fees":268.7,"depreciation":212.82,"technology_expense":424.75,"sebi_settlement":0,"csr_expense":38.62,"other_expense":194.89,"sgf_contribution":0,"total_expense":1389.52,"ebitda":4260.61,"ebitda_margin":0.75,"share_profit_associates":29.67,"profit_sale_investment":0,"discontinued_operations":0,"pbt":4290.28,"income_tax":1085.38,"tax_rate":0.25,"pat":3204.9,"pat_margin":0.57,"eps":12.95},{"quarter":"Q3 FY 2027","trading_days":62,"is_predicted":true,"transaction_rev":4030,"listing_income":null,"data_centre":null,"data_feed":null,"index_licensing":null,"clearing_settlement":null,"operating_investment":1899.69,"other_operating":null,"investment_income":null,"other_non_operating":null,"total_revenue":5929.69,"employee_cost":262.09,"regulatory_fees":281.99,"depreciation":223.36,"technology_expense":445.77,"sebi_settlement":0,"csr_expense":38.62,"other_expense":194.89,"sgf_contribution":0,"total_expense":1446.71,"ebitda":4482.98,"ebitda_margin":0.76,"share_profit_associates":29.67,"profit_sale_investment":0,"discontinued_operations":0,"pbt":4512.65,"income_tax":1141.64,"tax_rate":0.25,"pat":3371.01,"pat_margin":0.57,"eps":13.62},{"quarter":"Q4 FY 2027","trading_days":62,"is_predicted":true,"transaction_rev":4340,"listing_income":null,"data_centre":null,"data_feed":null,"index_licensing":null,"clearing_settlement":null,"operating_investment":2045.83,"other_operating":null,"investment_income":null,"other_non_operating":null,"total_revenue":6385.83,"employee_cost":282.25,"regulatory_fees":303.68,"depreciation":240.54,"technology_expense":480.06,"sebi_settlement":0,"csr_expense":38.62,"other_expense":194.89,"sgf_contribution":0,"total_expense":1540.04,"ebitda":4845.79,"ebitda_margin":0.76,"share_profit_associates":29.67,"profit_sale_investment":0,"discontinued_operations":0,"pbt":4875.45,"income_tax":1233.42,"tax_rate":0.25,"pat":3642.03,"pat_margin":0.57,"eps":14.72}],"pnl_fy":[{"fy":"FY 2025","total_revenue":19174,"total_expense":5041,"ebitda":14133,"ebitda_margin":0.74,"pbt":16055,"pat":12186,"pat_margin":0.64,"eps":49.24},{"fy":"FY 2026","total_revenue":18989.83,"total_expense":5902.79,"ebitda":13087.03,"ebitda_margin":0.69,"pbt":14392.0,"pat":10625.29,"pat_margin":0.56,"eps":42.93},{"fy":"FY 2027","total_revenue":22453.39,"total_expense":5527.96,"ebitda":16925.42,"ebitda_margin":0.75,"pbt":17044.09,"pat":12732.16,"pat_margin":0.57,"eps":51.44}],"cost_ratios":{"Q3 FY 2025":{"employee_pct":0.03391593841032043,"regulatory_pct":0.049937578027465665,"depreciation_pct":0.02746566791510612,"technology_pct":0.056179775280898875,"other_income_ratio":0.39506531204644413},"Q4 FY 2025":{"employee_pct":0.03798044120991585,"regulatory_pct":0.03502387991812599,"depreciation_pct":0.03434159654309757,"technology_pct":0.06913804866954743,"other_income_ratio":0.4960871044572984},"Q1 FY 2026":{"employee_pct":0.04126719466444352,"regulatory_pct":0.035431429762401004,"depreciation_pct":0.03126302626094206,"technology_pct":0.06461025427261359,"other_income_ratio":0.5231746031746032},"Q2 FY 2026":{"employee_pct":0.04471153846153846,"regulatory_pct":0.046875,"depreciation_pct":0.03870192307692308,"technology_pct":0.07572115384615384,"other_income_ratio":0.49371633752244165},"Q3 FY 2026":{"employee_pct":0.04368600682593857,"regulatory_pct":0.048236632536973835,"depreciation_pct":0.0366325369738339,"technology_pct":0.07463026166097839,"other_income_ratio":0.44906033630069236},"Q4 FY 2026":{"employee_pct":0.04419877264373852,"regulatory_pct":0.047555816268486914,"depreciation_pct":0.03766723002537849,"technology_pct":0.0751757077535661,"other_income_ratio":0.471388336911567},"Q1 FY 2027":{"employee_pct":0.04419877264373852,"regulatory_pct":0.047555816268486914,"depreciation_pct":0.03766723002537849,"technology_pct":0.0751757077535661,"other_income_ratio":0.471388336911567},"Q2 FY 2027":{"employee_pct":0.04419877264373852,"regulatory_pct":0.047555816268486914,"depreciation_pct":0.03766723002537849,"technology_pct":0.0751757077535661,"other_income_ratio":0.471388336911567},"Q3 FY 2027":{"employee_pct":0.04419877264373852,"regulatory_pct":0.047555816268486914,"depreciation_pct":0.03766723002537849,"technology_pct":0.0751757077535661,"other_income_ratio":0.471388336911567},"Q4 FY 2027":{"employee_pct":0.04419877264373852,"regulatory_pct":0.047555816268486914,"depreciation_pct":0.03766723002537849,"technology_pct":0.0751757077535661,"other_income_ratio":0.471388336911567}},"take_rates":{"futures":3.46e-05,"options":0.0007006,"cash":5.94e-05},"vix":[{"date":"2025-09-10","price":10.5375},{"date":"2025-09-11","price":10.36},{"date":"2025-09-12","price":10.1225},{"date":"2025-09-15","price":10.3975},{"date":"2025-09-16","price":10.2725},{"date":"2025-09-17","price":10.2475},{"date":"2025-09-18","price":9.885},{"date":"2025-09-19","price":9.9675},{"date":"2025-09-22","price":10.5575},{"date":"2025-09-23","price":10.625},{"date":"2025-09-24","price":10.5225},{"date":"2025-09-25","price":10.7825},{"date":"2025-09-26","price":11.425},{"date":"2025-09-29","price":11.365},{"date":"2025-09-30","price":11.065},{"date":"2025-10-01","price":10.2875},{"date":"2025-10-03","price":10.06},{"date":"2025-10-06","price":10.1925},{"date":"2025-10-07","price":10.05},{"date":"2025-10-08","price":10.3125},{"date":"2025-10-09","price":10.12},{"date":"2025-10-10","price":10.1025},{"date":"2025-10-13","price":11.0075},{"date":"2025-10-14","price":11.155},{"date":"2025-10-15","price":10.53},{"date":"2025-10-16","price":10.865},{"date":"2025-10-17","price":11.625},{"date":"2025-10-20","price":11.355},{"date":"2025-10-21","price":11.2975},{"date":"2025-10-23","price":11.7325},{"date":"2025-10-24","price":11.59},{"date":"2025-10-27","price":11.8575},{"date":"2025-10-28","price":11.9525},{"date":"2025-10-29","price":11.9725},{"date":"2025-10-30","price":12.0675},{"date":"2025-10-31","price":12.1525},{"date":"2025-11-03","price":12.665},{"date":"2025-11-04","price":12.6525},{"date":"2025-11-06","price":12.41},{"date":"2025-11-07","price":12.5575},{"date":"2025-11-10","price":12.3},{"date":"2025-11-11","price":12.49},{"date":"2025-11-12","price":12.11},{"date":"2025-11-13","price":12.1625},{"date":"2025-11-14","price":11.9375},{"date":"2025-11-17","price":11.7875},{"date":"2025-11-18","price":12.095},{"date":"2025-11-19","price":11.9725},{"date":"2025-11-20","price":12.135},{"date":"2025-11-21","price":13.63},{"date":"2025-11-24","price":13.235},{"date":"2025-11-25","price":12.2425},{"date":"2025-11-26","price":11.9675},{"date":"2025-11-27","price":11.785},{"date":"2025-11-28","price":11.6175},{"date":"2025-12-01","price":11.625},{"date":"2025-12-02","price":11.2275},{"date":"2025-12-03","price":11.2125},{"date":"2025-12-04","price":10.8175},{"date":"2025-12-05","price":10.315},{"date":"2025-12-08","price":11.125},{"date":"2025-12-09","price":10.9525},{"date":"2025-12-10","price":10.9125},{"date":"2025-12-11","price":10.4},{"date":"2025-12-12","price":10.1075},{"date":"2025-12-15","price":10.25},{"date":"2025-12-16","price":10.0625},{"date":"2025-12-17","price":9.8375},{"date":"2025-12-18","price":9.7075},{"date":"2025-12-19","price":9.5225},{"date":"2025-12-22","price":9.675},{"date":"2025-12-23","price":9.3775},{"date":"2025-12-24","price":9.19},{"date":"2025-12-26","price":9.15},{"date":"2025-12-29","price":9.72},{"date":"2025-12-30","price":9.6775},{"date":"2025-12-31","price":9.475},{"date":"2026-01-01","price":9.185},{"date":"2026-01-02","price":9.45},{"date":"2026-01-05","price":10.0225},{"date":"2026-01-06","price":10.0175},{"date":"2026-01-07","price":9.95},{"date":"2026-01-08","price":10.6},{"date":"2026-01-09","price":10.925},{"date":"2026-01-12","price":11.3675},{"date":"2026-01-13","price":11.1975},{"date":"2026-01-14","price":11.32},{"date":"2026-01-16","price":11.3725},{"date":"2026-01-19","price":11.8275},{"date":"2026-01-20","price":12.73},{"date":"2026-01-21","price":13.655},{"date":"2026-01-22","price":13.35},{"date":"2026-01-23","price":14.1925},{"date":"2026-01-27","price":14.4525},{"date":"2026-01-28","price":13.525},{"date":"2026-01-29","price":13.37},{"date":"2026-01-30","price":13.6325},{"date":"2026-02-01","price":15.095},{"date":"2026-02-02","price":13.865},{"date":"2026-02-03","price":12.895},{"date":"2026-02-04","price":12.2525},{"date":"2026-02-05","price":12.1675},{"date":"2026-02-06","price":11.94},{"date":"2026-02-09","price":12.19},{"date":"2026-02-10","price":11.665},{"date":"2026-02-11","price":11.5475},{"date":"2026-02-12","price":11.725},{"date":"2026-02-13","price":13.2925},{"date":"2026-02-16","price":13.33},{"date":"2026-02-17","price":12.6725},{"date":"2026-02-18","price":12.2225},{"date":"2026-02-19","price":13.46},{"date":"2026-02-20","price":14.3625},{"date":"2026-02-23","price":14.1675},{"date":"2026-02-24","price":14.15},{"date":"2026-02-25","price":13.4875},{"date":"2026-02-26","price":13.0625},{"date":"2026-02-27","price":13.7025},{"date":"2026-03-02","price":17.13},{"date":"2026-03-04","price":20.72}],"summary":{"current_quarter":"Q4 FY 2026","cq_total_rev":2595.16,"cq_options_rev":2049.05,"cq_futures_rev":253.03,"cq_cash_rev":293.09,"cq_trading_days":42,"last5_total":343.75,"prev5_total":320.21,"wow_change":0.0735,"last_date":"2026-03-02"}};

const ENRICHED_DATA = {"summary_total":{"quarterly":{"current":{"label":"Q4 FY 2026","value":61.78962613985715,"qoq":0.2756708290802061,"yoy":0.3169769436944925},"previous":{"label":"Q3 FY 2026","value":48.436967226419355},"prev2":{"label":"Q4 FY 2025","value":46.91777364493549}},"monthly":{"current":{"label":"FY 2026 February","value":61.763997923809534,"mom":0.03083981852439388,"mo6m":0.1800093361770605},"previous":{"label":"FY 2026 January","value":59.91619339290001},"avg_6m":{"label":"Avg Of Last 6 Months","value":52.34195699155201}},"weekly":{"last5":{"label":"Last 5 Trading Days","value":68.7491096524,"wow":0.07349110204944043,"wo10w":0.16639509390659857},"prev5":{"label":"Previous 5 Trading Days","value":64.0425519328},"last50":{"label":"Last 50 Trading Days","value":58.941528485119996}},"day_of_week":{"Monday":{"latest":99.796473616,"do3d":0.28650875326492375,"do10d":0.5763454294486885,"avg_3d":77.57154653066667,"avg_10d":63.3087594582},"Tuesday":{"latest":88.52581547,"do3d":0.24477549573865587,"do10d":0.19150488755335449,"avg_3d":71.11789698066666,"avg_10d":74.29748412680001},"Wednesday":{"latest":48.760474956,"do3d":0.1215138051836826,"do10d":0.05299669849758515,"avg_3d":43.47737382333334,"avg_10d":46.306389208599995},"Thursday":{"latest":42.97626919399999,"do3d":-0.035224839180969525,"do10d":0.002201281276082767,"avg_3d":44.54537278666666,"avg_10d":42.8818741274},"Friday":{"latest":63.686515025999995,"do3d":-0.02986720706687085,"do10d":0.04548170822671116,"avg_3d":65.64721395866667,"avg_10d":60.91595340679999}},"previous_week":{"Monday":77.14089730799999,"Tuesday":67.763112836,"Wednesday":42.850415984,"Thursday":53.50267391800001,"Friday":78.955659618}},"seg_options":{"quarterly":{"current":{"label":"Q4 FY 2026","value":48.78680745085715,"qoq":0.3077707535843346,"yoy":0.36714171230438386},"previous":{"label":"Q3 FY 2026","value":37.305320766},"prev2":{"label":"Q4 FY 2025","value":35.685259993}},"monthly":{"current":{"label":"FY 2026 February","value":49.081479143619056,"mom":0.054070280030936946,"mo6m":0.2074704358504691},"previous":{"label":"FY 2026 January","value":46.563763416400015},"avg_6m":{"label":"Avg Of Last 6 Months","value":40.648182917248015}},"weekly":{"last5":{"label":"Last 5 Trading Days","value":56.2897728564,"wow":0.1571066253245461,"wo10w":0.2287468751945987},"prev5":{"label":"Previous 5 Trading Days","value":48.6470059236},"last50":{"label":"Last 50 Trading Days","value":45.810714959079995}},"day_of_week":{"Monday":{"latest":87.059582592,"do3d":0.3596333501454978,"do10d":0.7080409603837754,"avg_3d":64.03166161133333,"avg_10d":50.9704302246},"Tuesday":{"latest":71.475919606,"do3d":0.21899532456235749,"do10d":0.18921124019866253,"avg_3d":58.63510562,"avg_10d":60.103636082400016},"Wednesday":{"latest":38.537245636,"do3d":0.17125528124703204,"do10d":0.1331971394168412,"avg_3d":32.902516004000006,"avg_10d":34.007538755199995},"Thursday":{"latest":33.157352247999995,"do3d":0.04954437472265627,"do10d":0.07752720821612225,"avg_3d":31.592139452666665,"avg_10d":30.771707661},"Friday":{"latest":51.218764199999995,"do3d":0.0005717722434936956,"do10d":0.09073435140776165,"avg_3d":51.18949546733333,"avg_10d":46.95805549159999}},"fy":{"current":38.501369409100434,"previous":43.75153097090762,"yoy":-0.11999949362453766}},"seg_futures":{"quarterly":{"current":{"label":"Q4 FY 2026","value":6.024498740714286,"qoq":0.14745023795883205,"yoy":0.08343685078455909},"previous":{"label":"Q3 FY 2026","value":5.250335519064515},"prev2":{"label":"Q4 FY 2025","value":5.560544425225808}},"monthly":{"current":{"label":"FY 2026 February","value":5.8724620321904775,"mom":-0.06049245676572523,"mo6m":0.07861893500477746},"previous":{"label":"FY 2026 January","value":6.250574648899999},"avg_6m":{"label":"Avg Of Last 6 Months","value":5.444426981216}},"weekly":{"last5":{"label":"Last 5 Trading Days","value":5.206482748,"wow":-0.4655116885403433,"wo10w":-0.17212354704558586},"prev5":{"label":"Previous 5 Trading Days","value":9.741060068800001},"last50":{"label":"Last 50 Trading Days","value":6.28896102724}},"day_of_week":{"Monday":{"latest":4.695751456,"do3d":-0.33749058805318133,"do10d":-0.19874866381222045,"avg_3d":7.087826031333333,"avg_10d":5.8605224652},"Tuesday":{"latest":10.337422624,"do3d":0.7191898687851972,"do10d":0.48126096263203944,"avg_3d":6.012961576666667,"avg_10d":6.978799067000001},"Wednesday":{"latest":3.778104788,"do3d":-0.13339840270090353,"do10d":-0.3267119948490782,"avg_3d":4.3596790033333335,"avg_10d":5.611424470800001},"Thursday":{"latest":3.364170802,"do3d":-0.488988944060611,"do10d":-0.4114282415715943,"avg_3d":6.5833620680000005,"avg_10d":5.7158209748},"Friday":{"latest":3.85696407,"do3d":-0.47207112127225714,"do10d":-0.44604403465145115,"avg_3d":7.305840285333334,"avg_10d":6.962582427599999}},"fy":{"current":5.442625925834063,"previous":6.432189862907633,"yoy":-0.15384557330623372}},"seg_cash":{"quarterly":{"current":{"label":"Q4 FY 2026","value":6.978319948285715,"qoq":0.18652457213530127,"yoy":0.23031696212742903},"previous":{"label":"Q3 FY 2026","value":5.881310941354838},"prev2":{"label":"Q4 FY 2025","value":5.671969226709678}},"monthly":{"current":{"label":"FY 2026 February","value":6.810056747999999,"mom":-0.041087654723967804,"mo6m":0.08972291770002094},"previous":{"label":"FY 2026 January","value":7.101855327599999},"avg_6m":{"label":"Avg Of Last 6 Months","value":6.249347093087999}},"weekly":{"last5":{"label":"Last 5 Trading Days","value":7.2528540480000006,"wow":0.2826725761540989,"wo10w":0.06007167638765787},"prev5":{"label":"Previous 5 Trading Days","value":5.6544859404},"last50":{"label":"Last 50 Trading Days","value":6.841852498799999}},"day_of_week":{"Monday":{"latest":8.041139568,"do3d":0.24629047992036845,"do10d":0.2413367449035746,"avg_3d":6.452058888000001,"avg_10d":6.477806768400001},"Tuesday":{"latest":6.7124732400000005,"do3d":0.03750383922001488,"do10d":-0.0696565940126308,"avg_3d":6.469829784000001,"avg_10d":7.2150489773999995},"Wednesday":{"latest":6.445124532,"do3d":0.03699744171608388,"do10d":-0.036232393634029414,"avg_3d":6.215178816000001,"avg_10d":6.6874259826},"Thursday":{"latest":6.454746144,"do3d":0.013324425950808516,"do10d":0.00944594759218842,"avg_3d":6.369871266,"avg_10d":6.3943454916},"Friday":{"latest":8.610786756,"do3d":0.20398956861095074,"do10d":0.2309361559551686,"avg_3d":7.151878205999999,"avg_10d":6.9953154876}},"fy":{"current":6.182179664777292,"previous":6.710016804289156,"yoy":-0.07866405627694717}},"pnl_predictor":{"q4_fy2026_trading_days_so_far":42,"q4_fy2025_total_trading_days":62,"daily_avg_rev":61.78962613985713,"transaction_rev_extrapolated":3830.956820671142,"other_income_ratio":0.471388336911567,"total_revenue_predicted":5636.825185147336,"pat_predicted":3196.991373345787},"pnl_predicted_quarters":{"Q4 FY 2026":{"transaction_rev":3830.956820671142,"operating_investment":1805.8683644761938,"total_revenue":5636.825185147336,"total_expense":1386.7943801605304,"ebitda":4250.030804986805,"ebitda_margin":0.7539759821158473,"pbt":4279.697471653472,"pat":3196.991373345787,"pat_margin":0.5671617033236456,"eps":12.91713686200318},"Q1 FY 2027":{"transaction_rev":3050,"operating_investment":1437.7344275802793,"total_revenue":4487.734427580279,"total_expense":1151.6932532186277,"ebitda":3336.0411743616514,"ebitda_margin":0.7433686703605579,"pbt":3365.707841028318,"pat":2514.228868801934,"pat_margin":0.5602445753808942,"eps":10.158500480007813},"Q2 FY 2027":{"transaction_rev":3840,"operating_investment":1810.1312137404173,"total_revenue":5650.1312137404175,"total_expense":1389.5167607007568,"ebitda":4260.6144530396605,"ebitda_margin":0.7540735412796035,"pbt":4290.281119706327,"pat":3204.89750029696,"pat_margin":0.5672253225735797,"eps":12.949080809280646},"Q3 FY 2027":{"transaction_rev":4030,"operating_investment":1899.694997753615,"total_revenue":5929.694997753615,"total_expense":1446.7148194622816,"ebitda":4482.980178291334,"ebitda_margin":0.7560220517226688,"pbt":4512.646844958001,"pat":3371.007677491966,"pat_margin":0.5684959645932931,"eps":13.62023304037158},"Q4 FY 2027":{"transaction_rev":4340,"operating_investment":2045.8253821962007,"total_revenue":6385.825382196201,"total_expense":1540.037967967927,"ebitda":4845.7874142282735,"ebitda_margin":0.758834938978823,"pbt":4875.4540808949405,"pat":3642.029545546976,"pat_margin":0.5703302748773904,"eps":14.715270891098893}}};

// ========================
// UTILITIES
// ========================

function fmt(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  const n = Number(num);
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' Cr';
}

function fmtNum(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(num) {
  if (num == null || isNaN(num)) return '—';
  const pct = (Number(num) * 100).toFixed(1);
  return pct + '%';
}

function fmtPctRaw(num) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toFixed(1) + '%';
}

function deltaClass(val) {
  if (val > 0.001) return 'positive';
  if (val < -0.001) return 'negative';
  return 'neutral';
}

function deltaStr(val) {
  if (val == null || isNaN(val)) return '';
  const pct = (val * 100).toFixed(1);
  const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '—';
  return arrow + ' ' + Math.abs(pct) + '%';
}

function fmtPrice(num) {
  if (num == null || isNaN(num)) return '—';
  return '₹ ' + Number(num).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ========================
// CHART COLORS — Apple Palette
// ========================

// Options gets brighter cyan for dark bg visibility, Futures coral, Cash purple
const CHART_COLORS = ['#2997ff', '#ff6b6b', '#30d158', '#bf5af2', '#ff9f0a', '#64d2ff'];
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif";

// Theme-aware helpers
function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function getGridColor() {
  return getTheme() === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
}

function getTickColor() {
  return getTheme() === 'light' ? '#6e6e73' : '#86868b';
}

function getTooltipBg() {
  return getTheme() === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 28, 30, 0.95)';
}

function getTooltipText() {
  return getTheme() === 'light' ? '#1d1d1f' : '#f5f5f7';
}

function getDonutBorderColor() {
  return getTheme() === 'light' ? '#f5f5f7' : '#1c1c1e';
}

function getScaleBorderColor() {
  return getTheme() === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
}

function getHeatmapRgb() {
  return '0, 113, 227';
}

function applyChartDefaults() {
  Chart.defaults.color = getTickColor();
  Chart.defaults.font.family = FONT_FAMILY;
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.tooltip.backgroundColor = getTooltipBg();
  Chart.defaults.plugins.tooltip.titleColor = getTooltipText();
  Chart.defaults.plugins.tooltip.bodyColor = getTooltipText();
  Chart.defaults.plugins.tooltip.borderColor = getTheme() === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleFont = { size: 11, weight: '600' };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.scale.grid = { color: getGridColor() };
  Chart.defaults.scale.border = { color: getScaleBorderColor() };
  Chart.defaults.elements.line.tension = 0.3;
  Chart.defaults.elements.line.borderWidth = 2;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
  Chart.defaults.animation.duration = 700;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

applyChartDefaults();

function chartHeight(px) { return { height: px + 'px' }; }

function setCanvasHeight(id, h) {
  const c = document.getElementById(id);
  if (c) c.parentElement.style.height = h + 'px';
}

// ========================
// THEME TOGGLE
// ========================

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  // Theme persists only during session (in-memory)
  toggle.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    updateChartsForTheme();
  });
}

function updateChartsForTheme() {
  applyChartDefaults();
  
  // Update all chart instances
  Object.entries(charts).forEach(([key, chart]) => {
    if (!chart) return;
    
    // Update grid and tick colors on all scales
    if (chart.options && chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = getGridColor();
        if (scale.border) scale.border.color = getScaleBorderColor();
        if (scale.ticks) scale.ticks.color = getTickColor();
        if (scale.title && scale.title.color) {
          // Update axis title colors — keep them matching chart colors
        }
      });
    }
    
    // Update tooltip
    if (chart.options && chart.options.plugins && chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = getTooltipBg();
      chart.options.plugins.tooltip.titleColor = getTooltipText();
      chart.options.plugins.tooltip.bodyColor = getTooltipText();
      chart.options.plugins.tooltip.borderColor = getTheme() === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    }
    
    // Update donut border color
    if (key === 'donut' && chart.data && chart.data.datasets[0]) {
      chart.data.datasets[0].borderColor = getDonutBorderColor();
      chart.data.datasets[0].hoverBorderColor = getDonutBorderColor();
    }
    
    chart.update('none');
  });

  // Rebuild heatmap (uses inline colors)
  if (document.getElementById('heatmapContainer').innerHTML) {
    buildHeatmap();
  }
}

initThemeToggle();

// ========================
// TAB NAVIGATION
// ========================

const tabNames = {
  executive: 'Executive Summary',
  segment: 'Segment Deep-Dive',
  temporal: 'Temporal Analysis',
  prediction: 'PAT Prediction Engine',
  advanced: 'Advanced Analytics',
  revenue: 'Revenue Summary'
};

const charts = {};

document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('headerTitle').textContent = tabNames[tab] || tab;

    // Close mobile nav
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');

    // Resize charts after tab switch
    setTimeout(() => {
      Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
    }, 50);
  });
});

// Sub-tabs
document.querySelectorAll('.sub-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const st = btn.dataset.subtab;
    btn.closest('.tab-content').querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    btn.closest('.tab-content').querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
    document.getElementById('subtab-' + st).classList.add('active');
    setTimeout(() => {
      Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
    }, 50);
  });
});

// Mobile nav
document.getElementById('mobileNavToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
});

// ========================
// TAB 1: EXECUTIVE SUMMARY
// ========================

function buildKPIs() {
  const s = DATA.summary;
  const q = DATA.quarterly;
  const cq = q[q.length - 1]; // Current quarter
  const pq = q[q.length - 2]; // Previous quarter

  const qoq = (cq.total_rev - pq.total_rev) / pq.total_rev;
  const optQoq = (cq.opt_rev - pq.opt_rev) / pq.opt_rev;
  const futQoq = (cq.fut_rev - pq.fut_rev) / pq.fut_rev;
  const cashQoq = (cq.cash_rev - pq.cash_rev) / pq.cash_rev;

  // Latest PAT from pnl — last actual quarter
  const actualPnl = DATA.pnl.filter(p => !p.is_predicted);
  const lastPnl = actualPnl[actualPnl.length - 1];
  const prevPnl = actualPnl.length > 1 ? actualPnl[actualPnl.length - 2] : null;
  const patQoq = prevPnl ? (lastPnl.pat - prevPnl.pat) / prevPnl.pat : 0;

  const kpis = [
    { label: 'Quarter Revenue', value: fmt(cq.total_rev), delta: qoq, sub: cq.quarter },
    { label: 'Options Revenue', value: fmt(cq.opt_rev), delta: optQoq, sub: fmtPct(cq.opt_rev / cq.total_rev) + ' of total' },
    { label: 'Futures Revenue', value: fmt(cq.fut_rev), delta: futQoq, sub: '' },
    { label: 'Cash Revenue', value: fmt(cq.cash_rev), delta: cashQoq, sub: '' },
    { label: 'Latest PAT', value: fmt(lastPnl.pat), delta: patQoq, sub: lastPnl.quarter },
    { label: 'EBITDA Margin', value: fmtPct(lastPnl.ebitda_margin), delta: prevPnl ? (lastPnl.ebitda_margin - prevPnl.ebitda_margin) / prevPnl.ebitda_margin : 0, sub: 'vs ' + (prevPnl ? fmtPct(prevPnl.ebitda_margin) : '—') },
  ];

  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <span class="kpi-delta ${deltaClass(k.delta)}">${deltaStr(k.delta)}</span>
      ${k.sub ? `<div style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:4px">${k.sub}</div>` : ''}
    </div>
  `).join('');
}

function buildDonutChart() {
  const q = DATA.quarterly;
  const cq = q[q.length - 1];
  setCanvasHeight('chartDonut', 260);
  charts.donut = new Chart(document.getElementById('chartDonut'), {
    type: 'doughnut',
    data: {
      labels: ['Options', 'Futures', 'Cash'],
      datasets: [{
        data: [cq.opt_rev, cq.fut_rev, cq.cash_rev],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[3]],
        borderColor: getDonutBorderColor(),
        borderWidth: 2,
        hoverBorderColor: getDonutBorderColor(),
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16 }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return ctx.label + ': ' + fmt(ctx.raw) + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });
}

function buildQuarterlyRevChart() {
  const q = DATA.quarterly;
  setCanvasHeight('chartQuarterlyRev', 300);
  charts.quarterlyRev = new Chart(document.getElementById('chartQuarterlyRev'), {
    type: 'bar',
    data: {
      labels: q.map(x => { const p = x.quarter.split(' '); return p[0] + " '" + p[2].slice(2); }),
      datasets: [
        { label: 'Cash', data: q.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], borderRadius: 2, stack: 'stack', order: 3 },
        { label: 'Futures', data: q.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], borderRadius: 2, stack: 'stack', order: 2 },
        { label: 'Options', data: q.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], borderRadius: 2, stack: 'stack', order: 1 },
      ]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });
}

function buildWeeklyRevChart() {
  const w = DATA.weekly;
  setCanvasHeight('chartWeeklyRev', 260);
  charts.weeklyRev = new Chart(document.getElementById('chartWeeklyRev'), {
    type: 'bar',
    data: {
      labels: w.map(x => {
        const d = new Date(x.week);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        { label: 'Cash', data: w.map(x => x.cash_rev), backgroundColor: CHART_COLORS[3], stack: 's', borderRadius: 2, order: 3 },
        { label: 'Futures', data: w.map(x => x.fut_rev), backgroundColor: CHART_COLORS[1], stack: 's', borderRadius: 2, order: 2 },
        { label: 'Options', data: w.map(x => x.opt_rev), backgroundColor: CHART_COLORS[0], stack: 's', borderRadius: 2, order: 1 },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });
}

// ========================
// TAB 2: SEGMENT DEEP-DIVE
// ========================

function buildSegmentCharts() {
  const d = DATA.daily;
  const labels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  // Options: IO vs SO
  setCanvasHeight('chartIOSO', 280);
  charts.ioso = new Chart(document.getElementById('chartIOSO'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'IO Revenue', data: d.map(x => x.io_rev), borderColor: CHART_COLORS[0], backgroundColor: CHART_COLORS[0] + '20', fill: true },
        { label: 'SO Revenue', data: d.map(x => x.so_rev), borderColor: CHART_COLORS[1], backgroundColor: CHART_COLORS[1] + '20', fill: true },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } }
    }
  });

  // IO Premium Turnover
  setCanvasHeight('chartPremium', 280);
  charts.premium = new Chart(document.getElementById('chartPremium'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'IO Premium (₹ Cr)',
        data: d.map(x => x.io_premium),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // IO PCR
  setCanvasHeight('chartPCR', 260);
  charts.pcr = new Chart(document.getElementById('chartPCR'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'IO Put-Call Ratio',
        data: d.map(x => x.io_pcr),
        borderColor: CHART_COLORS[5],
        pointRadius: 1,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 15, font: { size: 10 } } },
        y: { suggestedMin: 0.5, suggestedMax: 1.5 }
      }
    }
  });

  // Futures: IF vs SF
  setCanvasHeight('chartIFSF', 280);
  charts.ifsf = new Chart(document.getElementById('chartIFSF'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'IF Revenue', data: d.map(x => x.if_rev), borderColor: CHART_COLORS[2], backgroundColor: CHART_COLORS[2] + '20', fill: true },
        { label: 'SF Revenue', data: d.map(x => x.sf_rev), borderColor: CHART_COLORS[5], backgroundColor: CHART_COLORS[5] + '20', fill: true },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 1) } }
      },
      plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } } }
    }
  });

  // Futures Turnover
  setCanvasHeight('chartFutTurnover', 280);
  charts.futTurnover = new Chart(document.getElementById('chartFutTurnover'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'IF Turnover', data: d.map(x => x.if_turnover), backgroundColor: CHART_COLORS[2] },
        { label: 'SF Turnover', data: d.map(x => x.sf_turnover), backgroundColor: CHART_COLORS[5] },
      ]
    },
    options: {
      scales: {
        x: { stacked: true, ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { stacked: true, ticks: { callback: v => '₹' + (v / 1000).toFixed(0) + 'K Cr' } }
      }
    }
  });

  // Cash: Traded Value
  setCanvasHeight('chartCashValue', 280);
  charts.cashValue = new Chart(document.getElementById('chartCashValue'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cash Traded Value (₹ Cr)',
        data: d.map(x => x.cash_traded_value),
        backgroundColor: CHART_COLORS[3],
        borderRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  // Cash Revenue
  setCanvasHeight('chartCashRev', 280);
  charts.cashRev = new Chart(document.getElementById('chartCashRev'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cash Revenue',
        data: d.map(x => x.cash_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        fill: true,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 1) + ' Cr' } }
      }
    }
  });
}

// ========================
// TAB 3: TEMPORAL ANALYSIS
// ========================

function buildTemporalCharts() {
  // Day-of-week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dowData = days.map(d => DATA.dow_avg[d] || { avg_total: 0, avg_options: 0, avg_futures: 0, avg_cash: 0 });

  setCanvasHeight('chartDOW', 280);
  charts.dow = new Chart(document.getElementById('chartDOW'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: 'Options', data: dowData.map(x => x.avg_options), backgroundColor: CHART_COLORS[0], stack: 's', borderRadius: 2 },
        { label: 'Futures', data: dowData.map(x => x.avg_futures), backgroundColor: CHART_COLORS[1], stack: 's', borderRadius: 2 },
        { label: 'Cash', data: dowData.map(x => x.avg_cash), backgroundColor: CHART_COLORS[3], stack: 's', borderRadius: 2 },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw),
            footer: items => 'Total Avg: ' + fmt(items.reduce((s, i) => s + i.raw, 0))
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Monthly revenue
  const m = DATA.monthly;
  setCanvasHeight('chartMonthlyRev', 280);
  charts.monthlyRev = new Chart(document.getElementById('chartMonthlyRev'), {
    type: 'line',
    data: {
      labels: m.map(x => x.month),
      datasets: [{
        label: 'Monthly Revenue',
        data: m.map(x => x.total_rev),
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true,
        pointRadius: 2,
      }]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 18, maxRotation: 45, font: { size: 9 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });

  // Daily with 10-day MA
  const d = DATA.daily;
  const dailyLabels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });
  const dailyRev = d.map(x => x.total_rev);
  const ma10 = dailyRev.map((_, i) => {
    if (i < 9) return null;
    let sum = 0;
    for (let j = i - 9; j <= i; j++) sum += dailyRev[j];
    return sum / 10;
  });

  setCanvasHeight('chartDailyMA', 280);
  charts.dailyMA = new Chart(document.getElementById('chartDailyMA'), {
    type: 'line',
    data: {
      labels: dailyLabels,
      datasets: [
        { label: 'Daily Revenue', data: dailyRev, borderColor: CHART_COLORS[0] + '60', borderWidth: 1, pointRadius: 1 },
        { label: '10-day MA', data: ma10, borderColor: CHART_COLORS[5], borderWidth: 2.5 },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 15, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });

  // Quarterly comparison table
  buildQuarterlyTable();
}

function buildQuarterlyTable() {
  const q = DATA.quarterly;
  let html = '<thead><tr><th>Quarter</th><th>Options</th><th>Futures</th><th>Cash</th><th>Total</th><th>QoQ %</th><th>YoY %</th></tr></thead><tbody>';
  for (let i = 0; i < q.length; i++) {
    const r = q[i];
    const qoq = i > 0 ? ((r.total_rev - q[i-1].total_rev) / q[i-1].total_rev) : null;
    const yoy = i >= 4 ? ((r.total_rev - q[i-4].total_rev) / q[i-4].total_rev) : null;
    html += `<tr>
      <td>${r.quarter}</td>
      <td>${fmt(r.opt_rev)}</td>
      <td>${fmt(r.fut_rev)}</td>
      <td>${fmt(r.cash_rev)}</td>
      <td style="font-weight:600">${fmt(r.total_rev)}</td>
      <td class="${qoq !== null ? deltaClass(qoq) : ''}">${qoq !== null ? deltaStr(qoq) : '—'}</td>
      <td class="${yoy !== null ? deltaClass(yoy) : ''}">${yoy !== null ? deltaStr(yoy) : '—'}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tableQuarterly').innerHTML = html;
}

// ========================
// TAB 4: PAT PREDICTION
// ========================

let predState = {};

function initPrediction() {
  // Get the last actual quarter's cost ratios
  const actualPnl = DATA.pnl.filter(p => !p.is_predicted);
  const lastActual = actualPnl[actualPnl.length - 1];
  const lastQ = lastActual.quarter;
  const cr = DATA.cost_ratios[lastQ] || Object.values(DATA.cost_ratios)[Object.values(DATA.cost_ratios).length - 1];

  // Current quarter revenue run-rate
  const cq = DATA.quarterly[DATA.quarterly.length - 1];
  const days = cq.days || 62;
  const annualFactor = 62 / Math.max(days, 1);

  predState = {
    optRev: Math.round(cq.opt_rev * annualFactor),
    futRev: Math.round(cq.fut_rev * annualFactor),
    cashRev: Math.round(cq.cash_rev * annualFactor),
    empPct: (cr.employee_pct * 100) || 4.0,
    regPct: (cr.regulatory_pct * 100) || 4.5,
    techPct: (cr.technology_pct * 100) || 7.0,
    depPct: (cr.depreciation_pct * 100) || 3.5,
    otherIncome: (cr.other_income_ratio * 100) || 45,
  };

  // Set slider values
  setSlider('sliderOpt', 'valOpt', predState.optRev, v => fmt(v));
  setSlider('sliderFut', 'valFut', predState.futRev, v => fmt(v));
  setSlider('sliderCash', 'valCash', predState.cashRev, v => fmt(v));
  setSlider('sliderEmp', 'valEmp', predState.empPct, v => v.toFixed(1) + '%');
  setSlider('sliderReg', 'valReg', predState.regPct, v => v.toFixed(1) + '%');
  setSlider('sliderTech', 'valTech', predState.techPct, v => v.toFixed(1) + '%');
  setSlider('sliderDep', 'valDep', predState.depPct, v => v.toFixed(1) + '%');
  setSlider('sliderOther', 'valOther', predState.otherIncome, v => v.toFixed(0) + '%');

  // Listeners
  const sliders = ['sliderOpt', 'sliderFut', 'sliderCash', 'sliderEmp', 'sliderReg', 'sliderTech', 'sliderDep', 'sliderOther'];
  sliders.forEach(id => {
    document.getElementById(id).addEventListener('input', () => updatePrediction());
  });

  // Scenario buttons
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyScenario(btn.dataset.scenario);
    });
  });

  updatePrediction();
  buildPnLTable();
  buildPATHistoryChart();
}

function setSlider(sliderId, valId, value, formatter) {
  const sl = document.getElementById(sliderId);
  const vl = document.getElementById(valId);
  sl.value = value;
  vl.textContent = formatter(value);
  sl.addEventListener('input', () => {
    vl.textContent = formatter(Number(sl.value));
  });
}

function applyScenario(scenario) {
  const cq = DATA.quarterly[DATA.quarterly.length - 1];
  const days = cq.days || 62;
  const annualFactor = 62 / Math.max(days, 1);
  let factor = 1;
  if (scenario === 'bear') factor = 0.85;
  if (scenario === 'bull') factor = 1.15;

  document.getElementById('sliderOpt').value = Math.round(cq.opt_rev * annualFactor * factor);
  document.getElementById('sliderFut').value = Math.round(cq.fut_rev * annualFactor * factor);
  document.getElementById('sliderCash').value = Math.round(cq.cash_rev * annualFactor * factor);

  // Trigger display update
  document.getElementById('valOpt').textContent = fmt(Number(document.getElementById('sliderOpt').value));
  document.getElementById('valFut').textContent = fmt(Number(document.getElementById('sliderFut').value));
  document.getElementById('valCash').textContent = fmt(Number(document.getElementById('sliderCash').value));

  updatePrediction();
}

function updatePrediction() {
  const optRev = Number(document.getElementById('sliderOpt').value);
  const futRev = Number(document.getElementById('sliderFut').value);
  const cashRev = Number(document.getElementById('sliderCash').value);
  const empPct = Number(document.getElementById('sliderEmp').value) / 100;
  const regPct = Number(document.getElementById('sliderReg').value) / 100;
  const techPct = Number(document.getElementById('sliderTech').value) / 100;
  const depPct = Number(document.getElementById('sliderDep').value) / 100;
  const otherIncome = Number(document.getElementById('sliderOther').value) / 100;

  const transactionRev = optRev + futRev + cashRev;
  const otherRev = transactionRev * otherIncome;
  const totalRev = transactionRev + otherRev;

  const empCost = totalRev * empPct;
  const regCost = totalRev * regPct;
  const techCost = totalRev * techPct;
  const depCost = totalRev * depPct;
  const csrOther = totalRev * 0.035; // ~3.5% for CSR + other
  const totalExp = empCost + regCost + techCost + depCost + csrOther;

  const ebitda = totalRev - totalExp + depCost; // Add back depreciation for EBITDA
  const ebitdaMargin = ebitda / totalRev;
  const pbt = totalRev - totalExp;
  const tax = pbt * 0.252;
  const pat = pbt - tax;
  const patMargin = pat / totalRev;

  // Display results
  const container = document.getElementById('predResult');
  container.innerHTML = `
    <div class="pred-card">
      <div class="pred-label">Total Revenue</div>
      <div class="pred-value">${fmt(totalRev)}</div>
    </div>
    <div class="pred-card">
      <div class="pred-label">EBITDA</div>
      <div class="pred-value">${fmt(ebitda)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(ebitdaMargin)} margin</div>
    </div>
    <div class="pred-card highlight">
      <div class="pred-label">Predicted PAT</div>
      <div class="pred-value" style="color:var(--color-primary-hover)">${fmt(pat)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(patMargin)} margin</div>
    </div>
    <div class="pred-card">
      <div class="pred-label">EPS (est.)</div>
      <div class="pred-value">₹ ${(pat / 247.5).toFixed(2)}</div>
      <div style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:4px">~247.5 Cr shares</div>
    </div>
  `;

  // Update waterfall
  buildWaterfallChart(transactionRev, otherRev, totalRev, totalExp, empCost, regCost, techCost, depCost, csrOther, ebitda, pbt, tax, pat);
}

function buildWaterfallChart(txnRev, otherRev, totalRev, totalExp, emp, reg, tech, dep, csrOther, ebitda, pbt, tax, pat) {
  if (charts.waterfall) charts.waterfall.destroy();
  setCanvasHeight('chartWaterfall', 300);

  const labels = ['Txn Rev', 'Other Income', 'Total Rev', 'Employee', 'Regulatory', 'Technology', 'Depreciation', 'Other Exp', 'PBT', 'Tax', 'PAT'];

  // Use Chart.js floating bars: each data point is [low, high]
  let running = 0;
  const floatingData = [];
  const colors = [];

  // Txn Rev: 0 → txnRev
  floatingData.push([0, txnRev]); colors.push(CHART_COLORS[0]);
  // Other Income: txnRev → txnRev + otherRev
  floatingData.push([txnRev, txnRev + otherRev]); colors.push(CHART_COLORS[3]);
  // Total Rev: 0 → totalRev (summary bar)
  floatingData.push([0, totalRev]); colors.push(CHART_COLORS[0]);
  // Expense cascade — each expense chips away from totalRev
  running = totalRev;
  floatingData.push([running - emp, running]); running -= emp; colors.push(CHART_COLORS[4]);
  floatingData.push([running - reg, running]); running -= reg; colors.push(CHART_COLORS[4]);
  floatingData.push([running - tech, running]); running -= tech; colors.push(CHART_COLORS[4]);
  floatingData.push([running - dep, running]); running -= dep; colors.push(CHART_COLORS[4]);
  floatingData.push([running - csrOther, running]); running -= csrOther; colors.push(CHART_COLORS[4]);
  // PBT: 0 → pbt (summary bar)
  floatingData.push([0, pbt]); colors.push(CHART_COLORS[5]);
  // Tax: pat → pbt (tax sits on top of PAT)
  floatingData.push([pat, pbt]); colors.push(CHART_COLORS[1]);
  // PAT: 0 → pat (final result)
  floatingData.push([0, pat]); colors.push('#30d158');

  charts.waterfall = new Chart(document.getElementById('chartWaterfall'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'P&L Waterfall',
        data: floatingData,
        backgroundColor: colors,
        borderRadius: 3,
        borderSkipped: false,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const range = ctx.raw;
              const value = Math.abs(range[1] - range[0]);
              return ctx.label + ': ' + fmt(value);
            }
          }
        }
      },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 9 } } },
        y: { beginAtZero: true, ticks: { callback: v => '₹' + fmtNum(v, 0) } }
      }
    }
  });
}

function buildPATHistoryChart() {
  const p = DATA.pnl;
  if (!p || p.length === 0) return;
  setCanvasHeight('chartPATHistory', 300);

  // Separate into actual vs predicted, using a single dataset approach
  const allLabels = p.map(x => {
    const parts = x.quarter.split(' ');
    return parts[0] + " '" + parts[2].slice(2);
  });
  const barColors = p.map(x => x.is_predicted ? CHART_COLORS[5] : CHART_COLORS[0]);
  const borderColors = p.map(x => x.is_predicted ? CHART_COLORS[5] : CHART_COLORS[0]);
  const patValues = p.map(x => x.pat);

  if (charts.patHistory) charts.patHistory.destroy();

  charts.patHistory = new Chart(document.getElementById('chartPATHistory'), {
    type: 'bar',
    data: {
      labels: allLabels,
      datasets: [{
        label: 'PAT',
        data: patValues,
        backgroundColor: barColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            generateLabels: function() {
              return [
                { text: 'Actual PAT', fillStyle: CHART_COLORS[0], strokeStyle: CHART_COLORS[0], lineWidth: 0, hidden: false },
                { text: 'Predicted PAT', fillStyle: CHART_COLORS[5], strokeStyle: CHART_COLORS[5], lineWidth: 0, hidden: false },
              ];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const isPred = DATA.pnl[ctx.dataIndex].is_predicted;
              const prefix = isPred ? 'Predicted: ' : 'Actual: ';
              return prefix + fmt(ctx.raw);
            }
          }
        }
      },
      scales: {
        x: { ticks: { maxRotation: 45, font: { size: 10 } } },
        y: { ticks: { callback: v => '₹' + fmtNum(v, 0) + ' Cr' } }
      }
    }
  });
}

function buildPnLTable() {
  const p = DATA.pnl;
  let html = '<thead><tr><th>Quarter</th><th>Txn Rev</th><th>Total Rev</th><th>Total Exp</th><th>EBITDA</th><th>EBITDA %</th><th>PAT</th><th>PAT %</th><th>EPS</th></tr></thead><tbody>';
  for (const q of p) {
    const cls = q.is_predicted ? 'predicted' : '';
    html += `<tr class="${cls}">
      <td>${q.quarter}</td>
      <td>${fmt(q.transaction_rev)}</td>
      <td>${fmt(q.total_revenue)}</td>
      <td>${fmt(q.total_expense)}</td>
      <td>${fmt(q.ebitda)}</td>
      <td>${fmtPct(q.ebitda_margin)}</td>
      <td style="font-weight:600">${fmt(q.pat)}</td>
      <td>${fmtPct(q.pat_margin)}</td>
      <td>₹ ${fmtNum(q.eps)}</td>
    </tr>`;
  }
  html += '</tbody>';
  document.getElementById('tablePnL').innerHTML = html;
}

// ========================
// TAB 5: ADVANCED ANALYTICS
// ========================

function buildAdvancedCharts() {
  const d = DATA.daily;
  const labels = d.map(x => {
    const dt = new Date(x.date);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  // PN ratio vs VIX (dual axis)
  setCanvasHeight('chartPNVix', 300);
  charts.pnVix = new Chart(document.getElementById('chartPNVix'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'P/N Ratio (bps)',
          data: d.map(x => x.pn_ratio * 10000),
          borderColor: CHART_COLORS[0],
          yAxisID: 'y1',
          borderWidth: 1.5,
          pointRadius: 1,
        },
        {
          label: 'India VIX',
          data: d.map(x => x.vix),
          borderColor: CHART_COLORS[5],
          yAxisID: 'y2',
          borderWidth: 2,
          borderDash: [4, 3],
          pointRadius: 0,
        },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y1: { position: 'left', title: { display: true, text: 'P/N Ratio (bps)', color: CHART_COLORS[0], font: { size: 10 } } },
        y2: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'India VIX', color: CHART_COLORS[5], font: { size: 10 } } },
      }
    }
  });

  // Scatter: Revenue vs VIX
  setCanvasHeight('chartScatter', 300);
  charts.scatter = new Chart(document.getElementById('chartScatter'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Daily Revenue vs VIX',
        data: d.map(x => ({ x: x.vix, y: x.total_rev })),
        backgroundColor: CHART_COLORS[0] + '80',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'India VIX', font: { size: 10 } }, ticks: { font: { size: 10 } } },
        y: { title: { display: true, text: 'Total Revenue (₹ Cr)', font: { size: 10 } }, ticks: { callback: v => '₹' + fmtNum(v, 0) } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => 'VIX: ' + fmtNum(ctx.raw.x, 1) + ', Rev: ' + fmt(ctx.raw.y)
          }
        }
      }
    }
  });

  // Contracts vs Revenue
  setCanvasHeight('chartContracts', 300);
  charts.contracts = new Chart(document.getElementById('chartContracts'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: d.map(x => x.total_rev),
          borderColor: CHART_COLORS[0],
          yAxisID: 'y1',
          borderWidth: 1.5,
        },
        {
          label: 'Contracts (Mn)',
          data: d.map(x => x.total_contracts / 1e6),
          borderColor: CHART_COLORS[4],
          yAxisID: 'y2',
          borderWidth: 1.5,
          borderDash: [4, 3],
        },
      ]
    },
    options: {
      scales: {
        x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
        y1: { position: 'left', title: { display: true, text: 'Revenue (₹ Cr)', color: CHART_COLORS[0], font: { size: 10 } } },
        y2: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Contracts (Mn)', color: CHART_COLORS[4], font: { size: 10 } } },
      }
    }
  });

  // Quarterly revenue heatmap (HTML table)
  buildHeatmap();
}

function buildHeatmap() {
  const q = DATA.quarterly;
  // Group by FY
  const fys = {};
  q.forEach(item => {
    const parts = item.quarter.split(' ');
    const qNum = parts[0]; // Q1, Q2, etc
    const fy = parts[1] + ' ' + parts[2]; // FY YYYY
    if (!fys[fy]) fys[fy] = {};
    fys[fy][qNum] = item;
  });

  // Find min/max for color scaling
  const allVals = q.map(x => x.total_rev);
  const minRev = Math.min(...allVals);
  const maxRev = Math.max(...allVals);

  const rgb = getHeatmapRgb();

  let html = '<table class="data-table"><thead><tr><th>FY</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>';
  Object.keys(fys).forEach(fy => {
    html += `<tr><td>${fy}</td>`;
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(qn => {
      const item = fys[fy][qn];
      if (item) {
        const intensity = (item.total_rev - minRev) / (maxRev - minRev);
        const bg = `rgba(${rgb}, ${(0.1 + intensity * 0.5).toFixed(2)})`;
        html += `<td style="background:${bg};font-weight:600">${fmt(item.total_rev)}</td>`;
      } else {
        html += `<td style="color:var(--color-text-faint)">—</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById('heatmapContainer').innerHTML = html;
}

// ========================
// TAB 4 ADDITION: PAT EXTRAPOLATION
// ========================

function buildExtrapolationKPIs() {
  const p = ENRICHED_DATA.pnl_predictor;
  const otherIncome = p.total_revenue_predicted - p.transaction_rev_extrapolated;

  const kpis = [
    { label: 'Daily Avg Txn Rev', value: fmt(p.daily_avg_rev) },
    { label: 'Trading Days (Actual / Expected)', value: `${p.q4_fy2026_trading_days_so_far} / ${p.q4_fy2025_total_trading_days}` },
    { label: 'Extrapolated Qtr Txn Rev', value: fmt(p.transaction_rev_extrapolated) },
    { label: `Other Income (${fmtPct(p.other_income_ratio)} of Txn Rev)`, value: fmt(otherIncome) },
    { label: 'Total Revenue (Predicted)', value: fmt(p.total_revenue_predicted), highlight: true },
    { label: 'Predicted PAT', value: fmt(p.pat_predicted), highlight: true },
  ];

  document.getElementById('extrapKpis').innerHTML = kpis.map(k => `
    <div class="extrap-card${k.highlight ? ' highlight' : ''}">
      <div class="extrap-label">${k.label}</div>
      <div class="extrap-value">${k.value}</div>
    </div>
  `).join('');
}

function buildPredictedPnLTable() {
  const quarters = ENRICHED_DATA.pnl_predicted_quarters;
  let html = '<thead><tr><th>Quarter</th><th>Txn Rev</th><th>Other Income</th><th>Total Rev</th><th>Total Exp</th><th>EBITDA</th><th>EBITDA %</th><th>PAT</th><th>PAT %</th><th>EPS</th></tr></thead><tbody>';

  let isFirst = true;
  for (const [qName, q] of Object.entries(quarters)) {
    const otherIncome = q.total_revenue - q.transaction_rev;
    const tag = isFirst ? ' <span style="color:var(--color-warning);font-size:10px;font-weight:600">CURRENT</span>' : '';
    const cls = isFirst ? '' : 'predicted';
    html += `<tr class="${cls}">
      <td>${qName}${tag}</td>
      <td>${fmt(q.transaction_rev)}</td>
      <td>${fmt(otherIncome)}</td>
      <td>${fmt(q.total_revenue)}</td>
      <td>${fmt(q.total_expense)}</td>
      <td>${fmt(q.ebitda)}</td>
      <td>${fmtPct(q.ebitda_margin)}</td>
      <td style="font-weight:600">${fmt(q.pat)}</td>
      <td>${fmtPct(q.pat_margin)}</td>
      <td>₹ ${fmtNum(q.eps)}</td>
    </tr>`;
    isFirst = false;
  }
  html += '</tbody>';
  document.getElementById('tablePredictedPnL').innerHTML = html;
}

// ========================
// PAT PREDICTOR — Daily Revenue Input
// ========================

function initPATPredictor() {
  const p = ENRICHED_DATA.pnl_predictor;
  const lastCostQ = Object.keys(DATA.cost_ratios).pop();
  const cr = DATA.cost_ratios[lastCostQ];

  // Set default values from actual data
  const dailyRevInput = document.getElementById('inputDailyRev');
  const tradingDaysInput = document.getElementById('inputTradingDays');
  const otherIncomeInput = document.getElementById('inputOtherIncomeRatio');
  const taxInput = document.getElementById('inputTaxRate');
  const sharesInput = document.getElementById('inputShares');

  // Pre-fill with current data
  dailyRevInput.value = p.daily_avg_rev.toFixed(1);
  otherIncomeInput.value = (p.other_income_ratio * 100).toFixed(1);

  // Show hint
  document.getElementById('predictorHint').textContent =
    'Current Q4 FY 2026 avg: ₹ ' + p.daily_avg_rev.toFixed(2) + ' Cr/day';

  // Store cost ratios for use in computation
  const costParams = {
    emp_pct: cr.employee_pct || 0.044,
    reg_pct: cr.regulatory_pct || 0.045,
    tech_pct: cr.technology_pct || 0.07,
    dep_pct: cr.depreciation_pct || 0.035,
    csr_other_pct: 0.035,
  };

  function computePredictor() {
    const dailyRev = Number(dailyRevInput.value) || 0;
    const tradingDays = Number(tradingDaysInput.value) || 62;
    const otherIncomeRatio = (Number(otherIncomeInput.value) || 0) / 100;
    const taxRate = (Number(taxInput.value) || 25.2) / 100;
    const shares = Number(sharesInput.value) || 247.5;

    if (dailyRev <= 0) {
      document.getElementById('predictorOutput').innerHTML = '';
      document.getElementById('predictorPEResults').innerHTML = '';
      return;
    }

    // Step 1: Extrapolate quarterly transaction revenue
    const qtrTxnRev = dailyRev * tradingDays;

    // Step 2: Add Other Income
    const otherIncome = qtrTxnRev * otherIncomeRatio;
    const totalRev = qtrTxnRev + otherIncome;

    // Step 3: Deduct expenses (based on cost ratios from latest actual quarter)
    const empCost = totalRev * costParams.emp_pct;
    const regCost = totalRev * costParams.reg_pct;
    const techCost = totalRev * costParams.tech_pct;
    const depCost = totalRev * costParams.dep_pct;
    const csrOther = totalRev * costParams.csr_other_pct;
    const totalExp = empCost + regCost + techCost + depCost + csrOther;

    // Step 4: PBT and PAT
    const pbt = totalRev - totalExp;
    const tax = pbt * taxRate;
    const pat = pbt - tax;

    // Step 5: EPS
    const qtrEPS = pat / shares;
    const annualEPS = qtrEPS * 4;

    // Render output cards
    document.getElementById('predictorOutput').innerHTML = `
      <div class="pred-card">
        <div class="pred-label">Qtr Txn Revenue</div>
        <div class="pred-value">${fmt(qtrTxnRev)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmt(dailyRev)}/day × ${tradingDays} days</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Other Income</div>
        <div class="pred-value">${fmt(otherIncome)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${(otherIncomeRatio * 100).toFixed(1)}% of Txn Rev</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Total Revenue</div>
        <div class="pred-value">${fmt(totalRev)}</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">Total Expenses</div>
        <div class="pred-value">${fmt(totalExp)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(totalExp / totalRev)} of revenue</div>
      </div>
      <div class="pred-card highlight">
        <div class="pred-label">Quarterly PAT</div>
        <div class="pred-value" style="color:var(--color-success)">${fmt(pat)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">${fmtPct(pat / totalRev)} margin</div>
      </div>
      <div class="pred-card">
        <div class="pred-label">EPS (Quarterly)</div>
        <div class="pred-value">₹ ${qtrEPS.toFixed(2)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px">Annualized: ₹ ${annualEPS.toFixed(2)}</div>
      </div>
    `;

    // Update PE valuation for predictor
    updatePredictorPE(annualEPS);
  }

  function updatePredictorPE(annualEPS) {
    if (!annualEPS || annualEPS <= 0) {
      document.getElementById('predictorPEResults').innerHTML = '';
      return;
    }

    const bearPE = Number(document.getElementById('predBearPE').value) || 25;
    const basePE = Number(document.getElementById('predBasePE').value) || 35;
    const bullPE = Number(document.getElementById('predBullPE').value) || 45;

    document.getElementById('predictorPEResults').innerHTML = `
      <div class="pe-card bear">
        <div class="pe-scenario-label">Bear Case</div>
        <div class="pe-subtitle">${bearPE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(bearPE * annualEPS)}</div>
      </div>
      <div class="pe-card base">
        <div class="pe-scenario-label">Base Case</div>
        <div class="pe-subtitle">${basePE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(basePE * annualEPS)}</div>
      </div>
      <div class="pe-card bull">
        <div class="pe-scenario-label">Bull Case</div>
        <div class="pe-subtitle">${bullPE}x PE × ₹${annualEPS.toFixed(2)} EPS</div>
        <div class="pe-price">${fmtPrice(bullPE * annualEPS)}</div>
      </div>
    `;
  }

  // Add listeners
  [dailyRevInput, tradingDaysInput, otherIncomeInput, taxInput, sharesInput].forEach(el => {
    el.addEventListener('input', computePredictor);
  });

  // PE input listeners
  ['predBearPE', 'predBasePE', 'predBullPE'].forEach(id => {
    document.getElementById(id).addEventListener('input', computePredictor);
  });

  // Initial computation
  computePredictor();
}

// ========================
// PE VALUATION TOOL (data-driven from ENRICHED_DATA)
// ========================

function initPEValuation() {
  const bearInput = document.getElementById('peBear');
  const baseInput = document.getElementById('peBase');
  const bullInput = document.getElementById('peBull');

  function updatePEResults() {
    // Get Q4 FY 2026 predicted EPS from ENRICHED_DATA
    const quarters = ENRICHED_DATA.pnl_predicted_quarters;
    const q4Data = quarters['Q4 FY 2026'];
    if (!q4Data || !q4Data.eps) return;

    const quarterlyEPS = q4Data.eps;
    const annualizedEPS = quarterlyEPS * 4;

    const bearPE = Number(bearInput.value) || 25;
    const basePE = Number(baseInput.value) || 35;
    const bullPE = Number(bullInput.value) || 45;

    const bearPrice = bearPE * annualizedEPS;
    const basePrice = basePE * annualizedEPS;
    const bullPrice = bullPE * annualizedEPS;

    document.getElementById('peResults').innerHTML = `
      <div class="pe-card bear">
        <div class="pe-scenario-label">Bear Case</div>
        <div class="pe-subtitle">${bearPE}x PE</div>
        <div class="pe-price">${fmtPrice(bearPrice)}</div>
      </div>
      <div class="pe-card base">
        <div class="pe-scenario-label">Base Case</div>
        <div class="pe-subtitle">${basePE}x PE</div>
        <div class="pe-price">${fmtPrice(basePrice)}</div>
      </div>
      <div class="pe-card bull">
        <div class="pe-scenario-label">Bull Case</div>
        <div class="pe-subtitle">${bullPE}x PE</div>
        <div class="pe-price">${fmtPrice(bullPrice)}</div>
      </div>
    `;
  }

  bearInput.addEventListener('input', updatePEResults);
  baseInput.addEventListener('input', updatePEResults);
  bullInput.addEventListener('input', updatePEResults);

  // Initial render
  updatePEResults();
}

// ========================
// TAB 6: REVENUE SUMMARY
// ========================

function fmtPctSigned(val) {
  if (val == null || isNaN(val)) return '<span class="neutral">—</span>';
  const pct = (Number(val) * 100).toFixed(1);
  const sign = val > 0 ? '+' : '';
  const cls = val > 0.001 ? 'positive' : val < -0.001 ? 'negative' : 'neutral';
  return `<span class="${cls}">${sign}${pct}%</span>`;
}

// ========================
// REVENUE SUMMARY WITH DROPDOWNS
// ========================

// Helper: get revenue field based on segment key
function getRevField(segKey) {
  if (segKey === 'total') return { qField: 'total_rev', mField: 'total_rev', dField: 'total_rev' };
  if (segKey === 'options') return { qField: 'opt_rev', mField: 'options_rev', dField: 'opt_rev' };
  if (segKey === 'futures') return { qField: 'fut_rev', mField: 'futures_rev', dField: 'fut_rev' };
  if (segKey === 'cash') return { qField: 'cash_rev', mField: 'cash_rev', dField: 'cash_rev' };
}

// Map quarter label to its FY year number for YoY lookup
function getYoYQuarter(qLabel) {
  // e.g. "Q4 FY 2026" → "Q4 FY 2025"
  const m = qLabel.match(/^(Q\d) FY (\d{4})$/);
  if (!m) return null;
  return m[1] + ' FY ' + (parseInt(m[2]) - 1);
}

// Map month short-label to get previous month label and 6-month avg
function getPrevMonthLabel(mIdx, allMonths) {
  return mIdx > 0 ? allMonths[mIdx - 1].month : null;
}

// Compute quarterly metrics for a selected quarter
function computeQuarterMetrics(qIdx, segKey) {
  const rf = getRevField(segKey);
  const allQ = DATA.quarterly;
  const sel = allQ[qIdx];
  const selAvg = sel[rf.qField] / sel.days;
  const prev = qIdx > 0 ? allQ[qIdx - 1] : null;
  const prevAvg = prev ? prev[rf.qField] / prev.days : null;
  const qoq = prevAvg ? (selAvg - prevAvg) / prevAvg : null;

  // YoY: same quarter name, previous FY
  const yoyLabel = getYoYQuarter(sel.quarter);
  const yoyQ = yoyLabel ? allQ.find(q => q.quarter === yoyLabel) : null;
  const yoyAvg = yoyQ ? yoyQ[rf.qField] / yoyQ.days : null;
  const yoy = yoyAvg ? (selAvg - yoyAvg) / yoyAvg : null;

  return {
    label: sel.quarter,
    value: selAvg,
    prevLabel: prev ? prev.quarter : '—',
    prevValue: prevAvg,
    qoq: qoq,
    yoyLabel: yoyLabel || '—',
    yoyValue: yoyAvg,
    yoy: yoy
  };
}

// Compute monthly metrics for a selected month
function computeMonthMetrics(mIdx, segKey) {
  const rf = getRevField(segKey);
  const allM = DATA.monthly;
  const sel = allM[mIdx];
  const selAvg = sel[rf.mField] / sel.trading_days;
  const prev = mIdx > 0 ? allM[mIdx - 1] : null;
  const prevAvg = prev ? prev[rf.mField] / prev.trading_days : null;
  const mom = prevAvg ? (selAvg - prevAvg) / prevAvg : null;

  // 6-month avg: average of up to 6 months ending at mIdx
  let sumAvg = 0, cnt = 0;
  for (let i = Math.max(0, mIdx - 5); i <= mIdx; i++) {
    sumAvg += allM[i][rf.mField] / allM[i].trading_days;
    cnt++;
  }
  const avg6m = cnt > 0 ? sumAvg / cnt : null;
  const mo6m = avg6m ? (selAvg - avg6m) / avg6m : null;

  return {
    label: sel.month,
    value: selAvg,
    prevLabel: prev ? prev.month : '—',
    prevValue: prevAvg,
    mom: mom,
    avg6mValue: avg6m,
    mo6m: mo6m
  };
}

function buildRevSummaryContent(segData, containerId, isTotal, segKey) {
  const s = segData;
  const wl5 = s.weekly.last5;
  const wp5 = s.weekly.prev5;
  const w50 = s.weekly.last50;
  const dow = s.day_of_week;

  // Build quarter dropdown options
  const allQ = DATA.quarterly;
  const defaultQIdx = allQ.length - 1;
  const qOptions = allQ.map((q, i) => `<option value="${i}"${i === defaultQIdx ? ' selected' : ''}>${q.quarter}</option>`).join('');

  // Build month dropdown options
  const allM = DATA.monthly;
  const defaultMIdx = allM.length - 1;
  const mOptions = allM.map((m, i) => `<option value="${i}"${i === defaultMIdx ? ' selected' : ''}>${m.month}</option>`).join('');

  // Unique IDs for this segment's dropdowns
  const qSelId = `revQSel_${segKey}`;
  const mSelId = `revMSel_${segKey}`;
  const qTbodyId = `revQTbody_${segKey}`;
  const mTbodyId = `revMTbody_${segKey}`;

  // Initial quarter computation
  const qm = computeQuarterMetrics(defaultQIdx, segKey);
  const qTbody = `
    <tr><td>${qm.label}</td><td>${fmt(qm.value)}</td><td>—</td></tr>
    <tr><td>vs Previous (${qm.prevLabel})</td><td>${qm.prevValue != null ? fmt(qm.prevValue) : '—'}</td><td>QoQ: ${fmtPctSigned(qm.qoq)}</td></tr>
    <tr><td>vs Year Ago (${qm.yoyLabel})</td><td>${qm.yoyValue != null ? fmt(qm.yoyValue) : '—'}</td><td>YoY: ${fmtPctSigned(qm.yoy)}</td></tr>`;

  // Initial month computation
  const mm = computeMonthMetrics(defaultMIdx, segKey);
  const mTbody = `
    <tr><td>${mm.label}</td><td>${fmt(mm.value)}</td><td>—</td></tr>
    <tr><td>vs Previous (${mm.prevLabel})</td><td>${mm.prevValue != null ? fmt(mm.prevValue) : '—'}</td><td>MoM: ${fmtPctSigned(mm.mom)}</td></tr>
    <tr><td>vs 6-Month Avg</td><td>${mm.avg6mValue != null ? fmt(mm.avg6mValue) : '—'}</td><td>Mo6M: ${fmtPctSigned(mm.mo6m)}</td></tr>`;

  // Section A: Quarterly with dropdown
  let quarterlyHTML = `
    <div class="rev-card">
      <h4>Quarterly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <div class="rev-dropdown-row"><label>Quarter</label><select class="rev-select" id="${qSelId}">${qOptions}</select></div>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody id="${qTbodyId}">${qTbody}</tbody>
      </table>
    </div>`;

  // Section B: Monthly with dropdown
  let monthlyHTML = `
    <div class="rev-card">
      <h4>Monthly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <div class="rev-dropdown-row"><label>Month</label><select class="rev-select" id="${mSelId}">${mOptions}</select></div>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody id="${mTbodyId}">${mTbody}</tbody>
      </table>
    </div>`;

  // Section C: Weekly (static)
  let weeklyHTML = `
    <div class="rev-card">
      <h4>Weekly Revenue <span class="rev-badge">Daily Avg</span></h4>
      <table class="data-table">
        <thead><tr><th>Period</th><th>Daily Avg Rev</th><th>Change</th></tr></thead>
        <tbody>
          <tr><td>Last 5 Trading Days</td><td>${fmt(wl5.value)}</td><td>—</td></tr>
          <tr><td>Previous 5 Trading Days</td><td>${fmt(wp5.value)}</td><td>WoW: ${fmtPctSigned(wl5.wow)}</td></tr>
          <tr><td>Last 50 Trading Days</td><td>${fmt(w50.value)}</td><td>Wo10W: ${fmtPctSigned(wl5.wo10w)}</td></tr>
        </tbody>
      </table>
    </div>`;

  // Section D: Day-of-Week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let dowRows = days.map(d => {
    const dd = dow[d];
    return `<tr>
      <td>${d}</td>
      <td>${fmt(dd.latest)}</td>
      <td>${fmt(dd.avg_3d)}</td>
      <td>${fmtPctSigned(dd.do3d)}</td>
      <td>${fmt(dd.avg_10d)}</td>
      <td>${fmtPctSigned(dd.do10d)}</td>
    </tr>`;
  }).join('');

  let dowHTML = `
    <div class="rev-card">
      <h4>Day-of-Week Analysis</h4>
      <table class="data-table">
        <thead><tr><th>Day</th><th>Latest (₹ Cr)</th><th>3-Day Avg</th><th>Do3D %</th><th>10-Day Avg</th><th>Do10D %</th></tr></thead>
        <tbody>${dowRows}</tbody>
      </table>
    </div>`;

  // Previous Week Breakdown (total only)
  let prevWeekHTML = '';
  if (isTotal && s.previous_week) {
    const pw = s.previous_week;
    let pwRows = days.map(d => `<tr><td>${d}</td><td>${fmt(pw[d])}</td></tr>`).join('');
    prevWeekHTML = `
    <div class="rev-card rev-full-width">
      <h4>Previous Week Breakdown</h4>
      <table class="data-table">
        <thead><tr><th>Day</th><th>Revenue (₹ Cr)</th></tr></thead>
        <tbody>${pwRows}</tbody>
      </table>
    </div>`;
  }

  // Layout: 2-col grid
  document.getElementById(containerId).innerHTML = `
    <div class="rev-summary-grid">
      <div>
        ${quarterlyHTML}
        <div style="margin-top:var(--space-4)">${weeklyHTML}</div>
      </div>
      <div>
        ${monthlyHTML}
        <div style="margin-top:var(--space-4)">${dowHTML}</div>
      </div>
      ${prevWeekHTML}
    </div>
  `;

  // Attach dropdown change handlers
  document.getElementById(qSelId).addEventListener('change', function() {
    const idx = parseInt(this.value);
    const q = computeQuarterMetrics(idx, segKey);
    document.getElementById(qTbodyId).innerHTML = `
      <tr><td>${q.label}</td><td>${fmt(q.value)}</td><td>—</td></tr>
      <tr><td>vs Previous (${q.prevLabel})</td><td>${q.prevValue != null ? fmt(q.prevValue) : '—'}</td><td>QoQ: ${fmtPctSigned(q.qoq)}</td></tr>
      <tr><td>vs Year Ago (${q.yoyLabel})</td><td>${q.yoyValue != null ? fmt(q.yoyValue) : '—'}</td><td>YoY: ${fmtPctSigned(q.yoy)}</td></tr>`;
  });

  document.getElementById(mSelId).addEventListener('change', function() {
    const idx = parseInt(this.value);
    const m = computeMonthMetrics(idx, segKey);
    document.getElementById(mTbodyId).innerHTML = `
      <tr><td>${m.label}</td><td>${fmt(m.value)}</td><td>—</td></tr>
      <tr><td>vs Previous (${m.prevLabel})</td><td>${m.prevValue != null ? fmt(m.prevValue) : '—'}</td><td>MoM: ${fmtPctSigned(m.mom)}</td></tr>
      <tr><td>vs 6-Month Avg</td><td>${m.avg6mValue != null ? fmt(m.avg6mValue) : '—'}</td><td>Mo6M: ${fmtPctSigned(m.mo6m)}</td></tr>`;
  });
}

function buildRevenueSummary() {
  buildRevSummaryContent(ENRICHED_DATA.summary_total, 'subtab-rev-total', true, 'total');
  buildRevSummaryContent(ENRICHED_DATA.seg_options, 'subtab-rev-options', false, 'options');
  buildRevSummaryContent(ENRICHED_DATA.seg_futures, 'subtab-rev-futures', false, 'futures');
  buildRevSummaryContent(ENRICHED_DATA.seg_cash, 'subtab-rev-cash', false, 'cash');
}

// ========================
// QUARTER COMPARISON CHART
// ========================

function initQuarterCompare() {
  // Get unique quarters from daily data
  const quarters = [...new Set(DATA.daily.map(d => d.fy_quarter))];
  const sel1 = document.getElementById('qtrSelect1');
  const sel2 = document.getElementById('qtrSelect2');

  // Populate dropdowns (most recent first)
  const reversedQ = [...quarters].reverse();
  reversedQ.forEach(q => {
    sel1.innerHTML += `<option value="${q}">${q}</option>`;
    sel2.innerHTML += `<option value="${q}">${q}</option>`;
  });
  // Default: latest quarter selected in sel1
  sel1.value = reversedQ[0];

  function renderQtrCompare() {
    if (charts.qtrCompare) charts.qtrCompare.destroy();

    const q1 = sel1.value;
    const q2 = sel2.value;
    if (!q1) return;

    const q1Data = DATA.daily.filter(d => d.fy_quarter === q1);

    // Use trading day index (Day 1, Day 2, ...) for x-axis alignment
    const maxDays = q1Data.length;
    const labels = q1Data.map((_, i) => 'Day ' + (i + 1));

    const datasets = [{
      label: q1,
      data: q1Data.map(d => d.total_rev),
      borderColor: CHART_COLORS[0],
      backgroundColor: CHART_COLORS[0] + '15',
      fill: true,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 5,
    }];

    if (q2) {
      const q2Data = DATA.daily.filter(d => d.fy_quarter === q2);
      // Extend labels if q2 has more days
      if (q2Data.length > maxDays) {
        for (let i = maxDays; i < q2Data.length; i++) {
          labels.push('Day ' + (i + 1));
        }
      }
      datasets.push({
        label: q2,
        data: q2Data.map(d => d.total_rev),
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '15',
        fill: true,
        borderWidth: 2,
        borderDash: [5, 3],
        pointRadius: 2,
        pointHoverRadius: 5,
      });
    }

    charts.qtrCompare = new Chart(document.getElementById('chartQtrCompare'), {
      type: 'line',
      data: { labels, datasets },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              title: items => items[0].label,
              label: ctx => {
                const qName = ctx.dataset.label;
                const dayIdx = ctx.dataIndex;
                const qData = ctx.dataset.label === q1
                  ? DATA.daily.filter(d => d.fy_quarter === q1)
                  : DATA.daily.filter(d => d.fy_quarter === q2);
                const actualDate = qData[dayIdx] ? qData[dayIdx].date : '';
                return qName + ': ' + fmt(ctx.raw) + (actualDate ? ' (' + actualDate + ')' : '');
              }
            }
          }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 20, font: { size: 10 } } },
          y: { ticks: { callback: v => '\u20b9' + fmtNum(v, 0) + ' Cr' } }
        }
      }
    });
  }

  sel1.addEventListener('change', renderQtrCompare);
  sel2.addEventListener('change', renderQtrCompare);
  renderQtrCompare();
}

// ========================
// INIT
// ========================

buildKPIs();
buildDonutChart();
buildQuarterlyRevChart();
buildWeeklyRevChart();
buildSegmentCharts();
buildTemporalCharts();
initQuarterCompare();
buildExtrapolationKPIs();
buildPredictedPnLTable();
initPATPredictor();
initPEValuation();
initPrediction();
buildAdvancedCharts();
buildRevenueSummary();
