const myhtml = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                </head>
                <body style="background-color:white">
                    <div id="chartWrapper" >
                    </div>
                    <span id='labels'></span>
                </body>
                
                
                <script type="text/javascript"> 
                
                
                 (function() {
                    
                   
                     document.addEventListener('message', function (e) {
                         
                         $('#chartWrapper').html('<canvas id="myChart" height="200" width="250"></canvas>');
                         
                         var dataFromNative = JSON.parse(e.data)
                         var labels = dataFromNative.labels
                         var chart_data_orders_for_chart = dataFromNative.chart_data_orders_for_chart
                         var chart_data_sales_for_chart = dataFromNative.chart_data_sales_for_chart

                         var data = {
                            labels: labels,
                            datasets: [{
                                label: 'Заказы',
                                backgroundColor: '#56B9F2',
                                borderColor: '#56B9F2',
                                data: chart_data_orders_for_chart,
                            },{
                                label: 'Прибыль',
                                backgroundColor: '#20B55F',
                                borderColor: '#20B55F',
                                data: chart_data_sales_for_chart,
                            }]
                         };
                    
                     var config = {
                          type: 'line',
                          data: data,
                          options: {
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                                display: false,
                              },
                              title: {
                                display: false,
                                text: 'Chart.js Line Chart'
                              }
                            }
                          },
                        };
                     var myChart = new Chart(
                        document.getElementById('myChart'),
                        config
                      );
                     
                     myChart.update()
                         
                     })
                     
                 }());
                 
                 
                 (function() {
                    
                     window.addEventListener('message', function (e) {
                         
                         $('#chartWrapper').html('<canvas id="myChart" height="200" width="250"></canvas>');
                        
                         
                         var dataFromNative = JSON.parse(e.data)
                         var labels = dataFromNative.labels
                         var chart_data_orders_for_chart = dataFromNative.chart_data_orders_for_chart
                         var chart_data_sales_for_chart = dataFromNative.chart_data_sales_for_chart

                         var data = {
                            labels: labels,
                            datasets: [{
                                label: 'Заказы',
                                backgroundColor: '#56B9F2',
                                borderColor: '#56B9F2',
                                data: chart_data_orders_for_chart,
                            },{
                                label: 'Прибыль',
                                backgroundColor: '#20B55F',
                                borderColor: '#20B55F',
                                data: chart_data_sales_for_chart,
                            }]
                         };
                             var config = {
                                  type: 'line',
                                  data: data,
                                  options: {
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                        display: false,
                                      },
                                      title: {
                                        display: false,
                                        text: 'Chart.js Line Chart'
                                      }
                                    }
                                  },
                                };
                     
                        var myChart = new Chart(
                                document.getElementById('myChart'),
                                config
                              );


                       myChart.update()

                     })
                     
                 }());
               
                </script>
               
            </html>
        `

export default myhtml
