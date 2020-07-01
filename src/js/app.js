App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvail: 750000,

    init: function() {
        console.log("app initialized...")
        return App.initWeb3();
    },
    initWeb3: function() {
        //console.log("in initweb3");
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
            //console.log("web3 defined");
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            //console.log("web3 undefined");
        }
        return App.initContracts();
    },
    initContracts: function() {
        $.getJSON("MingSale.json", function(mingsale) {
            App.contracts.MingSale = TruffleContract(mingsale);
            App.contracts.MingSale.setProvider(App.web3Provider);
            App.contracts.MingSale.deployed().then(function(mingsale) {
                console.log("Ming Sale Address: ", mingsale.address);
            })
        }).done(function() {
            $.getJSON("cryptoken.json", function(ming) {
                App.contracts.cryptoken = TruffleContract(ming);
                App.contracts.cryptoken.setProvider(App.web3Provider);
                App.contracts.cryptoken.deployed().then(function(ming) {
                    console.log("Ming Address: ", ming.address);
                });
                App.listenForEvents();
                return App.render();
            });
        });
    },
    listenForEvents: function() {
        App.contracts.MingSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            });
        });
    },
    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');
        loader.show();
        content.hide();
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                console.log("account", account);
                App.account = account;
                $('#account-address').html("Your Account: " + account);
            }
        });
        App.contracts.MingSale.deployed().then(function(instance) {
            tokensaleinstance = instance;
            return tokensaleinstance.getTokenPrice();
        }).then(function(price) {
            //console.log("tokenPrice", price.toNumber());
            App.tokenPrice = price;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return tokensaleinstance.tokensSold();
        }).then(function(sold) {
            App.tokensSold = sold.toNumber();
            //App.tokensSold = 600000;
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-avail').html(App.tokensAvail);

            var progressPercent = (App.tokensSold / App.tokensAvail) * 100;
            $('#progress').css('width', progressPercent + '%');

            App.contracts.cryptoken.deployed().then(function(instance) {
                tokeninstance = instance;
                return tokeninstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.token-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            }).catch(function(err) {
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        });
    },
    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numTokens = $('#numTokens').val();
        App.contracts.MingSale.deployed().then(function(instance) {
            return instance.buyTokens(numTokens, {
                from: App.account,
                value: numTokens * App.tokenPrice,
                gas: 500000,
            });
        }).then(function(result) {
            console.log("tokens bought...");
            $('form').trigger('reset');
            //$('#loader').hide();
            //$('#content').show();
        })
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
});