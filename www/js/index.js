/**
 * Created by Danila Loginov, December 23, 2016
 * https://github.com/1oginov/Cordova-Bluetooth-Terminal
 */

'use strict';
var db = null;
var conectado = false;
var app = {

    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function () {
        
        db = window.sqlitePlugin.openDatabase({name: 'coincoin.db', location: 'default'});
        app.geraBanco();
        //app.listaUsuario();
       // app.conecta();
        app.atualizarForms();
        app.atualizarMetas();
               
        $('#comecar').click(function(){
            app.conecta();
            app.inicia();
            app.saldo();
            app.metaBronze();
            app.metaPrata();
            app.metaOuro();
            app.atualizaBarra();
            
        });
        $('#refresh-paired-devices').click(app.listPairedDevices);
        $('#paired-devices form').submit(app.selectDevice);
        $('#toggle-connection').click(app.toggleConnection);
        $('#clear-data').click(app.clearData);
        $('#terminal form').submit(app.sendData);
        $("#visor").click(app.saldo);
        $("#zerar").click(app.zerar);
        $("#cadastrar").click(app.cadastrar);
        $("#validaSenha").click(app.verificaSenha);

        $('#terminal .go-back').click(function () {
            app.goTo('paired-devices');
        });

        $("#finalizarBronze").click(function(){
            app.cadastrarBronze();
        });

        $("#finalizarPrata").click(function(){
            app.cadastrarPrata();
        });

        $("#finalizarOuro").click(function(){
            app.cadastrarOuro();
        });

        $("#dicass").click(function(){
            app.metaBronze();
            app.metaPrata();
            app.metaOuro();
        });

    },

  
    listPairedDevices: function () {
        bluetoothSerial.list(function (devices) {
            var $list = $('#paired-devices .list');

            if (!devices.length) {
                $list.text('Not found');
                return;
            }

            $list.text('');
            devices.forEach(function (device) {
                $list.append('<label><input type="radio" name="device" value="' + device.address +
                    '"><div><span class="name">' + device.name + '</span> <span class="address">' + device.address +
                    '</span></div></label>');
            });

        }, app.showError);
    },

    selectDevice: function (event) {
        event.preventDefault();

        var $label = $('#paired-devices .list input[name=device]:checked').parent();

        var name = $label.find('.name').text();
        var address = $label.find('input').val();

        if (!address) {
            app.showError('Select paired device to connect');
            return;
        }

        app.goTo('terminal');

        var $selectedDevice = $('#selected-device');
        $selectedDevice.find('.name').text(name);
        $selectedDevice.find('.address').text(address);

        app.connect(address);
    },

    toggleConnection: function () {
        bluetoothSerial.isConnected(
            // Disconnect if connected
            function () {
                bluetoothSerial.disconnect(app.deviceDisconnected, app.showError);
            },

            // Reconnect to selected device if disconnected
            function () {
                var address = $('#selected-device .address').text();

                if (!address) {
                    app.showError('Select paired device to connect');
                    app.goTo('paired-devices');
                    return;
                }

                app.connect(address);
            }
        );
    },

    connect: function (address) {
        $('#selected-device .status').text('Connecting...');

        // Attempt to connect device with specified address, call app.deviceConnected if success
        bluetoothSerial.connect(address, app.deviceConnected, function (error) {
            $('#selected-device .status').text('Disconnected');
            app.showError(error);
        });
    },

    deviceConnected: function () {
        // Subscribe to data receiving as soon as the delimiter is read
        bluetoothSerial.subscribe('\n', app.handleData, app.showError);

        $('#selected-device .status').text('Connected');
        $('#toggle-connection').text('Disconnect');
    },

    deviceDisconnected: function () {
        // Unsubscribe from data receiving
        bluetoothSerial.unsubscribe(app.handleData, app.showError);

        $('#selected-device .status').text('Disconnected');
        $('#toggle-connection').text('Connect');
    },

    handleData: function (data) {
//alert(data);
        if(data.split("|")[0] == "s"){
            app.atualizaSaldo(data.split("|")[1]);
        }
        
        //app.displayInTerminal(data, true);
    },

    sendData: function (event) {
        event.preventDefault();

        var $input = $('#terminal form input[name=data]');
        var data = $input.val();
        $input.val('');

       // data += '\n';

        app.displayInTerminal(data, false);

        bluetoothSerial.write(data, null, app.showError);
    },

    saldo: function(){
        //alert("Cade o saldo?");
        var data = 's';
        bluetoothSerial.write(data, null, app.showError);
    },

    zerar: function (event) {
        event.preventDefault();
        var data = 'l';
        app.displayInTerminal(data, false);
        bluetoothSerial.write(data, null, app.showError);
    },

    atualizaSaldo: function(saldo){
        if(saldo != "" || saldo != undefined){

            db.transaction(function(tx) {
                tx.executeSql('UPDATE cadastros SET saldo = ? WHERE id = ?',[saldo, $("#id_cadastro").val()]);
              }, function(error) {
                app.showError('Erro ao atualizar saldo: ' + error.message);
              }, function() {
                $("#saldo").text("R$ " + saldo);
                $('#porcoGif').attr("src",$('#porcoGif').attr("src"));
                app.metaBronze();
                app.metaPrata();
                app.metaOuro();
                app.atualizaBarra();
              });
        } else {
            app.saldo();
        }
        
    },
    displayInTerminal: function (data, isIncoming) {
        var $dataContainer = $('#data');

        if (isIncoming) {
            data = '<span class="in">' + data + '</span>';
        }    
        else {
            data = '<span class="out">' + data + '</span>';
        }

        $dataContainer.append(data);

        if ($('#terminal input[name=autoscroll]').is(':checked')) {
            $dataContainer.scrollTop($dataContainer[0].scrollHeight - $dataContainer.height());
        }
    },

    clearData: function () {
        $('#data').text('');
    },

    goTo: function (state) {
        $('.state').hide();
        $('#' + state + '.state').show();
    },

    showError: function (error) {
        
        if(error.toUpperCase() == "DEVICE CONNECTION WAS LOST"){
            conectado = false;
            $("#modal_titulo").text("Erro");
            $("#modal_corpo").text("Conexão com o cofre foi perdida.");
            $(".trigger").click();
            app.vaPara("paraInicio");
        } else {
            $("#modal_titulo").text("Erro");
            $("#modal_corpo").text(error);
            $(".trigger").click();
        }
            
            //alert(error);
    },

    conecta: function(event) {
       // event.preventDefault();
        bluetoothSerial.list(function (devices) {
            var $list = $('#dica');
            var $endereco;
 
            if (!devices.length) {
                $list.text('Not found');
                return;
            }


            $list.text('');
            devices.forEach(function (device) {
                if(device.address == "98:D3:32:20:EB:63"){
                    $endereco = device.address;
                }
                
                $list.append('Nome: ' + device.name + "<br />" + "Endereço: " + device.address);
            });

            bluetoothSerial.isConnected(
                // Disconnect if connected
                function () {
                    bluetoothSerial.disconnect(app.deviceDisconnected, app.showError);
                },
    
                // Reconnect to selected device if disconnected
                function () {
                    
    
                    if (!$endereco) {
                        app.showError('Select paired device to connect');
                        app.goTo('paired-devices');
                        return;
                    }
    
                    app.connect($endereco);
                       // app.saldo();
                        $("#segue").removeClass("hide");
                },
            );
        }, app.showError);
    },

    geraBanco: function(){
        db.transaction(function(tx) {
        //   tx.executeSql('DROP TABLE cadastros');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cadastros (id,nomeCrianca, nomeResponsavel, email, senha, saldo)');
            //tx.executeSql('INSERT INTO usuario VALUES (?,?)', ['Papai', 101]);
            //tx.executeSql('INSERT INTO usuario VALUES (?,?)', ['Mamae', 202]);
          }, function(error) {
            app.showError('Transaction ERROR: ' + error.message);
          }, function() {
                
          });

          //Tabela de metas
          db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS metas (dias, valor, presente, tipoMeta,dataCriacao)');
              }, function(error) {
                app.showError('Transaction ERROR: ' + error.message);
              }, function() {
                    
              });
    },

    listaUsuario: function(){
        var nomes = "";
        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM usuario', [], function(tx, rs) {
              //alert('Quantidade de registros: ' + rs.rows.item(0).users);

              for(var i = 0; i < rs.rows.length; i++){
                nomes += "Nome: " + rs.rows.item(i).name + " Valor: " + rs.rows.item(i).valor + "\n";
              }

            }, function(tx, error) {
              app.showError('SELECT error: ' + error.message);
            });
          });
    }, 

    cadastrar: function(){
        var id = $("#id_cadastro").val();
        var nomeCrianca = $("#nome_da_crianca").val();
        var nomeResponsavel = $("#nome_do_responsavel").val();
        var email = $("#email_do_responsavel").val();
        var senha = $("#senha_do_responsavel").val();
        var saldo = 0.0;

        db.transaction(function(tx) {
            tx.executeSql('INSERT INTO cadastros VALUES (?,?,?,?,?,?)',[id,nomeCrianca,nomeResponsavel,email, senha, saldo]);
          }, function(error) {
            app.showError('Erro ao cadastrar: ' + error.message);
          }, function() {
           // app.showError('Cadastro realizado com sucesso!');
          });
       
          app.atualizarForms();
    }, 
    vaPara: function(painel){
        //alert("Pulando para " + painel);
        $("#"+painel).click();
    },
    inicia: function(){
        db.transaction(function(tx){
            tx.executeSql("select count(*) as quant from cadastros",[], function(tx,rs){
                if(rs.rows.item(0).quant > 0){
                    app.vaPara("paraCrianca");
                } else {
                    app.vaPara("paraCadastro");
                }
            });
        });
    },

    verificaSenha: function(){
        db.transaction(function(tx){
            tx.executeSql("SELECT senha AS sen FROM cadastros WHERE sen = ?",[$("#senhaDigitada").val() == undefined ? "cipa" : $("#senhaDigitada").val() ], function(tx,rs){
                if(rs.rows.length > 0){
                    app.vaPara("paraResponsavel");
                    $("#senhaDigitada").val("")
                    return;
                } else {
                    app.showError('Senha invalida');
                }                
            },function(error) {
                app.showError('Erro ao validar senha: ' + error.message);
              });
        });
    },

    cadastrarBronze: function(){
        var dias = $("#tempo_poupar_bronze").val();
        var quantidade = $("#quanto_poupar_bronze").val();
        var recompensa = $("#presente_bronze").val();
        var tipoMeta = "Bronze";

        app.cadastrarMeta(dias,quantidade,recompensa,tipoMeta);
        $("#boxBronze").removeClass("hide");
        app.metaBronze();
        app.atualizaBarra();

    },

    cadastrarPrata: function(){
        var dias = $("#tempo_poupar_prata").val();
        var quantidade = $("#quanto_poupar_prata").val();
        var recompensa = $("#presente_prata").val();
        var tipoMeta = "Prata";

        app.cadastrarMeta(dias,quantidade,recompensa,tipoMeta);
        $("#boxPrata").removeClass("hide");
        app.metaPrata();
        app.atualizaBarra();
    },

    cadastrarOuro: function(){
        var dias = $("#tempo_poupar_ouro").val();
        var quantidade = $("#quanto_poupar_ouro").val();
        var recompensa = $("#presente_ouro").val();
        var tipoMeta = "Ouro";

        app.cadastrarMeta(dias,quantidade,recompensa,tipoMeta);
        $("#boxOuro").removeClass("hide");
        app.metaOuro();
        app.atualizaBarra();

    },

    cadastrarMeta: function(dias,quantidade,recompensa,tipoMeta){
        db.transaction(function(tx){
            tx.executeSql("DELETE FROM metas WHERE tipoMeta = ?",[tipoMeta], function(){
                var agora = new Date();
                //alert(agora.getTime());
                tx.executeSql("INSERT INTO metas VALUES (?,?,?,?,?)",[dias,quantidade,recompensa,tipoMeta,agora.getTime()], function(tx,rs){
                    app.vaPara("paraCadastroMeta");
                },function(error) {
                    app.showError('Erro ao inserir nova meta: ' + error.message);
                });            
            },function(error) {
                app.showError('Erro ao excluir meta anterior: ' + error.message);
            });
        });
    },
    atualizarForms: function(){
        db.transaction(function(tx){
            tx.executeSql("select * from cadastros where id = ?",[$("#id_cadastro").val()],function(tx,rs){
              
                  $("#nomeCrianca").text(rs.rows.item(0).nomeCrianca);
                  $("#responsavelCrianca").text(rs.rows.item(0).nomeResponsavel);

                  $("#nome_da_crianca").val(rs.rows.item(0).nomeCrianca);
                  $("#nome_do_responsavel").val(rs.rows.item(0).nomeResponsavel);
                  $("#email_do_responsavel").val(rs.rows.item(0).email);
                  $("#senha_do_responsavel").val(rs.rows.item(0).senha);
                  $("#saldo").text("R$ " + rs.rows.item(0).saldo);
            });
        });
    },

    atualizarMetas: function(){
        db.transaction(function(tx){
            tx.executeSql("select * from metas where tipoMeta = ?",["Bronze"],function(tx,rs){
                $("#tempo_poupar_bronze").val(rs.rows.item(0).dias);
                $("#quanto_poupar_bronze").val(rs.rows.item(0).valor);
                $("#presente_bronze").val(rs.rows.item(0).presente);
            },
            function(error) {
                app.showError('Erro ao consultar meta de Bronze: ' + error.message);
            });  
            
            tx.executeSql("select * from metas where tipoMeta = ?",["Prata"],function(tx,rs){
                
                $("#tempo_poupar_prata").val(rs.rows.item(0).dias);
                $("#quanto_poupar_prata").val(rs.rows.item(0).valor);
                $("#presente_prata").val(rs.rows.item(0).presente);
                    
            }, function(error) {
                app.showError('Erro ao consultar meta de Prata: ' + error.message);
            });

            tx.executeSql("select * from metas where tipoMeta = ?",["Ouro"],function(tx,rs){
                
                $("#tempo_poupar_ouro").val(rs.rows.item(0).dias);
                $("#quanto_poupar_ouro").val(rs.rows.item(0).valor);
                $("#presente_ouro").val(rs.rows.item(0).presente);
                    
            },function(error) {
                app.showError('Erro ao consultar meta de Ouro: ' + error.message);
            });
        });
    },

    metaBronze: function(){
        var saldo;
        var metaBronze;
        var objetivoBronze;

        db.transaction(function(tx){
            tx.executeSql("select saldo from cadastros where id = ?",[$("#id_cadastro").val()],function(tx,rs){
                  saldo = parseFloat(rs.rows.item(0).saldo);
                    tx.executeSql("select valor,presente,dataCriacao,dias from metas where tipoMeta = ?",["Bronze"],function(tx,rs){
                          metaBronze = parseFloat(rs.rows.item(0).valor);
                          //app.showError("Saldo: " + saldo + " e meta Bronze: " + metaBronze + " agora faltam: " + (metaBronze - saldo) );
                        $(".saldoCard").text("R$ " + saldo);
                        $("#cardBronzeValor").text("R$ " + metaBronze);
                        $(".cardBronzePresente").text(rs.rows.item(0).presente);
                        
                        $("#boxBronze,#cardBronze").removeClass("hide").fadeIn();
                        $("#cardPrata,#boxPrata,#cardPrata,#boxOuro").addClass("hide");
                        
                        var porcentagem = app.calculaPorcentagem(saldo,metaBronze);

                        if(porcentagem >= 100){
                            $("#boxBronzeImagem").attr("src","img/meta-concluida.png")
                            $("#cardBronze").addClass("hide").fadeOut();
                            $("#cardPrata,#boxPrata").removeClass("hide").fadeIn();
                        } 

                        $("#progress-bronze").css("width",porcentagem+"%");
                        $("#porcentagem-progress-bronze").text(porcentagem+"%");

                        var dataBD = new Date(rs.rows.item(0).dataCriacao);
                        var dataTermino = app.somaDias(dataBD,rs.rows.item(0).dias);
                        

                        var quantidadeDias = app.dayDiff(dataBD,dataTermino);
                         
                        $("#metaDiaria-bronze").text("Meta diária: R$ " + parseFloat(((metaBronze-saldo)/quantidadeDias).toFixed(2)));
                        

                    },function(error) {
                        app.showError('Erro ao consultar valor de Bronze: ' + error.message);
                    });
            },function(error) {
                app.showError('Erro ao consultar saldo: ' + error.message);
            });
        });
    },
    metaPrata: function(){
        var saldo;
        var metaPrata;
        var objetivoPrata;

        db.transaction(function(tx){
            tx.executeSql("select saldo from cadastros where id = ?",[$("#id_cadastro").val()],function(tx,rs){
                  saldo = parseFloat(rs.rows.item(0).saldo);
                    tx.executeSql("select valor,presente,dataCriacao,dias from metas where tipoMeta = ?",["Prata"],function(tx,rs){
                          metaPrata = parseFloat(rs.rows.item(0).valor);
                          //app.showError("Saldo: " + saldo + " e meta Prata: " + metaPrata + " agora faltam: " + (metaPrata - saldo) );
                        $(".saldoCard").text("R$ " + saldo);
                        $("#cardPrataValor").text("R$ " + metaPrata);
                        $(".cardPrataPresente").text(rs.rows.item(0).presente);
                        
                        var porcentagem = app.calculaPorcentagem(saldo,metaPrata);

                        if(porcentagem >= 100){
                            //alert("Bateu a meta!");
                            $("#boxPrataImagem").attr("src","img/meta-concluida.png")
                            $("#cardPrata").addClass("hide").fadeOut();
                            $("#cardOuro,#boxOuro").removeClass("hide").fadeIn();
                        }

                        $("#progress-prata").css("width",porcentagem+"%");
                        $("#porcentagem-progress-prata").text(porcentagem+"%");

                        var dataBD = new Date(rs.rows.item(0).dataCriacao);
                        var dataTermino = app.somaDias(dataBD,rs.rows.item(0).dias);
                        

                        var quantidadeDias = app.dayDiff(dataBD,dataTermino);
                         
                        $("#metaDiaria-Prata").text("Meta diária: R$ " + parseFloat(((metaPrata-saldo)/quantidadeDias).toFixed(2)));
                        

                    },function(error) {
                        app.showError('Erro ao consultar valor de Prata: ' + error.message);
                    });
            },function(error) {
                app.showError('Erro ao consultar saldo: ' + error.message);
            });
        });
    },
    metaOuro: function(){
        var saldo;
        var metaOuro;
        var objetivoOuro;

        db.transaction(function(tx){
            tx.executeSql("select saldo from cadastros where id = ?",[$("#id_cadastro").val()],function(tx,rs){
                  saldo = parseFloat(rs.rows.item(0).saldo);
                    tx.executeSql("select valor,presente,dataCriacao,dias from metas where tipoMeta = ?",["Ouro"],function(tx,rs){
                          metaOuro = parseFloat(rs.rows.item(0).valor);
                          //app.showError("Saldo: " + saldo + " e meta Ouro: " + metaOuro + " agora faltam: " + (metaOuro - saldo) );
                        $(".saldoCard").text("R$ " + saldo);
                        $("#cardOuroValor").text("R$ " + metaOuro);
                        $(".cardOuroPresente").text(rs.rows.item(0).presente);
                        
                        var porcentagem = app.calculaPorcentagem(saldo,metaOuro);

                        if(porcentagem >= 100){
                            //alert("Bateu a meta!");
                            $("#boxOuroImagem").attr("src","img/meta-concluida.png")
                            $("#boxOuro").removeClass("hide").fadeIn();
                        }

                        $("#progress-ouro").css("width",porcentagem+"%");
                        $("#porcentagem-progress-ouro").text(porcentagem+"%");

                        var dataBD = new Date(rs.rows.item(0).dataCriacao);
                        var dataTermino = app.somaDias(dataBD,rs.rows.item(0).dias);
                        

                        var quantidadeDias = app.dayDiff(dataBD,dataTermino);
                         
                        $("#metaDiaria-ouro").text("Meta diária: R$ " + parseFloat(((metaOuro-saldo)/quantidadeDias).toFixed(2)));
                        

                    },function(error) {
                        app.showError('Erro ao consultar valor de Ouro: ' + error.message);
                    });
            },function(error) {
                app.showError('Erro ao consultar saldo: ' + error.message);
            });
        });
    },
    calculaPorcentagem: function(saldo,meta){
        return (parseInt(saldo * 100/meta));
    },

    somaDias: function(data,dias){
        var resultado = new Date(data);
        resultado.setDate(resultado.getDate() + parseInt(dias));
        return resultado;
    },

    dayDiff(inicio,fim){
        return Math.round((fim-inicio)/(1000*60*60*24));
    },

    getMaiorMeta: function(){
        db.transaction(function(tx){
            tx.executeSql("SELECT max(valor) valor FROM metas",[], function(tx,rs){
                return parseFloat(rs.rows.item(0).valor);
            },function(error) {
                app.showError('Erro ao descobrir maior meta : ' + error.message);
            });
        });
    },

    atualizaBarra: function(){
        var metaOuro;
        var metaPinBronze,metaPinPrata,metaPinOuro,saldoPin = 0;

        db.transaction(function(tx){
            tx.executeSql("SELECT valor FROM metas WHERE tipoMeta = ?",["Ouro"], function(tx,rs){
                metaOuro = parseFloat(rs.rows.item(0).valor);
                $(".pinOuro").css("width", "5%");
    
                tx.executeSql("SELECT valor FROM metas WHERE tipoMeta = ?",["Bronze"], function(tx,rs){
                    metaPinBronze = parseFloat(rs.rows.item(0).valor);
                    metaPinBronze = parseInt(105) - app.calculaPorcentagem(metaPinBronze,metaOuro);
                    $(".pinBronze").css("width",metaPinBronze + "%");
               },function(error) {
                   app.showError('Erro ao ajustar meta bronze : ' + error.message);
               });
    
               tx.executeSql("SELECT valor FROM metas WHERE tipoMeta = ?",["Prata"], function(tx,rs){
                   metaPinPrata = parseFloat(rs.rows.item(0).valor);
                   metaPinPrata = parseInt(105) - app.calculaPorcentagem(metaPinPrata,metaOuro);
                   $(".pinPrata").css("width",metaPinPrata + "%");
              },function(error) {
                  app.showError('Erro ao ajustar meta Prata : ' + error.message);
              }); 
              
              tx.executeSql("SELECT saldo FROM cadastros",[], function(tx,rs){
                    saldoPin = parseFloat(rs.rows.item(0).saldo);
                    saldoPin = app.calculaPorcentagem(saldoPin,metaOuro);

                    $(".barra-alcancada").attr("data-percent",saldoPin + "%");
                    $(".count-bar").css("width",saldoPin + "%");

                },function(error) {
                    app.showError('Erro ao ajustar porcentagem do saldo : ' + error.message);
                });

                tx.executeSql("SELECT COUNT(*) as qtd FROM metas",[], function(tx,rs){
                    $("#qtdMetas").text(rs.rows.item(0).qtd);

                },function(error) {
                    app.showError('Erro ao ajustar porcentagem do saldo : ' + error.message);
                });

               
    
           },function(error) {
               app.showError('Erro ao ajustar meta Ouro : ' + error.message);
           });
        });
    }
    
};

app.initialize();

//dias, valor, presente, tipoMeta,dataCriacao