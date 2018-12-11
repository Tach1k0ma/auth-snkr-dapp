// JS for snkrcertificate.html
var $sku_INPUT = $('#sku');
var $upc_INPUT = $('#upc');
var $image_url_INPUT = $('#image_url');
var snkrListLen;
var snkrTokenIds = [];
var snkrTokens = [];
var $snkrs_DIV = $('#snkrs');
var $errors_DIV = $('#errors');

function snkrImgGen(image_url){
    var img = $('<img>');
    img.attr('src', image_url);
    img.addClass('imageTag mt-3');
    return img;
}

App = {
    web3Provider: null,
    contracts: {},

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        // Initialize web3 and set the provider to the testRPC.
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },
    initContract: function() {

        $.getJSON('../build/contracts/Snkr.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var SneakerArtifact = data;
            App.contracts.Snkr = TruffleContract(SneakerArtifact);

            // Set the provider for our contract.
            App.contracts.Snkr.setProvider(App.web3Provider);

            $.getJSON('../build/contracts/Sale.json', function(data) {
                // Get the necessary contract artifact file and instantiate it with truffle-contract.
                var SaleArtifact = data;
                App.contracts.Sale = TruffleContract(SaleArtifact);

                // Set the provider for our contract.
                App.contracts.Sale.setProvider(App.web3Provider);

                return App.bindEvents();

            });
        });
    },
    bindEvents: function() {
        $(document).on('click', '#mintSneaker', App.mintSneaker);
        App.grabState();
    },
    grabState: function() {
        var snkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;

            return snkrInstance.totalSupply.call();

        }).then(function(result){
            snkrListLen = result.toNumber();

            var promises = [];

            promises.push(snkrInstance.owner.call(), snkrInstance.name.call(), snkrInstance.symbol.call());

            for (var i = 0; i < snkrListLen; i++) {
                promises.push(snkrInstance.tokenByIndex.call(i));
            }

            return Promise.all(promises);

        }).then(function(result) {

            //show the owner admin section if the person here is the owner
            if (web3.eth.accounts[0] == result[0]) $ownerSees_DIV.removeClass('hide');

            $ownerAddress_SPAN.text(result[0]);
            $name_SPAN.text(result[1]);
            $symbol_SPAN.text(result[2]);

            //update dogTokens globally
            snkrTokenIds = result.slice(3);

            var promises = [];

            for (var i = 0; i < snkrTokenIds.length; i++) {
                promises.push(snkrInstance.sneaker_id_to_struct(snkrTokenIds[i].toNumber()));
            }

            return Promise.all(promises);

        }).then(function(result) {

            snkrTokens = result;

            addSneakersToPage(snkrTokens, $snkrs_DIV);

        }).catch(function(err) {

            $errors_DIV.prepend(err.message);
        });
    },
    mintSneaker: function(event) {
        event.preventDefault();

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;

            return snkrInstance.mint($image_url_INPUT.val(), $sku_INPUT.val(), $upc_INPUT.val());
        }).then(function(result) {
          alert('Minting Successful!');
          $("#sneakerImage").append(snkrImgGen($image_url_INPUT.val()));
        }).catch(function(err) {
            console.log(err.message);
        });

    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});