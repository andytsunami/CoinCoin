/**
 * Created by Danila Loginov, December 23, 2016
 * https://github.com/1oginov/Cordova-Bluetooth-Terminal
 */

'use strict';
var db = null;
var app = {

    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function () {
        
        db = window.sqlitePlugin.openDatabase({name: 'coincoin.db', location: 'default'});
        app.geraBanco();
        //app.listaUsuario();
        app.conecta();
        app.atualizarForms();
        


       // $('#comecar').click(app.conecta);
        $('#segue').click(function(){
            app.saldo();
            app.inicia();
        });
        $('#refresh-paired-devices').click(app.listPairedDevices);
        $('#paired-devices form').submit(app.selectDevice);
        $('#toggle-connection').click(app.toggleConnection);
        $('#clear-data').click(app.clearData);
        $('#terminal form').submit(app.sendData);
        $("#saldo").click(app.saldo);
        $("#zerar").click(app.zerar);
        $("#cadastrar").click(app.cadastrar);

        $('#terminal .go-back').click(function () {
            app.goTo('paired-devices');
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
            $("#saldo").text("R$ " + saldo);
            $('#porcoGif').attr("src",$('#porcoGif').attr("src"));
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
        alert(error);
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
                        app.saldo();
                        $("#segue").removeClass("hide");
                },
            );
        }, app.showError);
    },

    geraBanco: function(){
        db.transaction(function(tx) {
        //    tx.executeSql('DROP TABLE cadastros');
            tx.executeSql('CREATE TABLE IF NOT EXISTS cadastros (nomeCrianca, nomeResponsavel, email, senha)');
            //tx.executeSql('INSERT INTO usuario VALUES (?,?)', ['Papai', 101]);
            //tx.executeSql('INSERT INTO usuario VALUES (?,?)', ['Mamae', 202]);
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
        var nomeCrianca = $("#nome_da_crianca").val();
        var nomeResponsavel = $("#nome_do_responsavel").val();
        var email = $("#email_do_responsavel").val();
        var senha = $("#senha_do_responsavel").val();

        db.transaction(function(tx) {
            tx.executeSql('INSERT INTO cadastros VALUES (?,?,?,?)',[nomeCrianca,nomeResponsavel,email, senha]);
          }, function(error) {
            app.showError('Erro ao cadastrar: ' + error.message);
          }, function() {
            app.showError('Cadastro realizado com sucesso!');
          });
       
          app.atualizarForms();
    }, 
    atualizarForms: function(){
        db.transaction(function(tx){
            tx.executeSql("select * from cadastros",[],function(tx,rs){
              
                  $("#nomeCrianca").text(rs.rows.item(0).nomeCrianca);
                  $("#responsavelCrianca").text(rs.rows.item(0).nomeResponsavel);

                  $("#nome_da_crianca").val(rs.rows.item(0).nomeCrianca);
                  $("#nome_do_responsavel").val(rs.rows.item(0).nomeResponsavel);
                  $("#email_do_responsavel").val(rs.rows.item(0).email);
                  $("#senha_do_responsavel").val(rs.rows.item(0).senha);
            });
        });
    },
    vaPara: function(painel){
        //alert("Pulando para " + painel);
        $("#"+painel).click();
    },
    inicia: function(){
        db.transaction(function(tx){
            tx.executeSql("select count(*) as quant from cadastros",[], function(tx,rs){
                if(rs.rows.item(0).quant > 0){
                    app.vaPara("paraResponsavel");
                }
            });
        });
    }
    
};

app.initialize();