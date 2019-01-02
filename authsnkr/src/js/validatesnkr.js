// JS for snkrcertificate.html
var $sku_INPUT = $('#sku');
var $upc_INPUT = $('#upc');
var $image_url_INPUT = $('#image_url');
var snkrListLen;
var snkrTokenIds = [];
var snkrTokens = [];
var $snkrs_DIV = $('#snkrs');
var $errors_DIV = $('#errors');

var $name_SPAN = $('#name');
var $symbol_SPAN = $('#symbol');
var $ownerAddress_SPAN = $('#address_owner');
var $sneakerAddress_SPAN = $('#sneaker_address');
var $sneaker_id_SPAN = $('#sneaker_id');

var $ownerSees_DIV = $('#ownerSees');
var $sneakerIdInput = $('#sneakerIdInput');
var $currentOwnerAddressInput = $('#currentOwnerAddress');

function snkrImgGen(image_url){
    var img = $('<img>');
    img.attr('src', image_url);
    img.addClass('imageTag mt-3');
    return img;
}

function addSneakersToPage(list, $id){
    $id.empty();
    var $snkrDiv;

    for (var i=0; i<list.length; i++){
        console.log(list)
        console.log(list[i])
        $snkrDiv = createSneakerDiv(list[i][0], list[i][1]["c"][0], list[i][3]["c"][0], list[i][4]["c"][0], list[i][4]["c"][0]);
        $id.append($snkrDiv);
    }
}

function afterIdText(id){
    var text;
    if (id == 1) text = 'st';
    if (id == 2) text = 'nd';
    if (id == 3) text = 'rd';
    if (id > 3) text = 'th';

    return text;
}

function createSneakerDiv(image, sku, upc, snkrId, sneakerAddress){
    var $cardContainer;
    var $cardBody;
    var $h5SKU;
    var $h5UPC;
    var $p_snkr_id;
    var $sneakerAddress;

    $cardContainer = $('<div>').attr('class', 'card float-left');

    $cardBody = $('<div>').attr('class', 'card-body');

    $snkrImg = snkrImgGen(image);

    $h5SKU = $('<h5>').attr('class', 'card-title').text(`SKU: ${sku}`);
    $h5UPC = $('<h5>').attr('class', 'card-title').text(`UPC: ${upc}`);

    var after_id_text = afterIdText(snkrId);

    $p_snkr_id = $('<p>').attr('class', 'card-text').text(`This SNKR is the ${snkrId}${after_id_text} SNKR that you have created.`);
    $sneakerAddress = $('<p>').attr('class', 'card-text').text(`This SNKR address is ${snkrId}${sneakerAddress}.`);

    $cardBody.append($snkrImg, $h5SKU, $h5UPC, $p_snkr_id);
    $cardContainer.append($cardBody);
    $cardContainer.attr('data-snkrid', snkrId);
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
        $.getJSON('Snkr.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var SneakerArtifact = data;
            App.contracts.Snkr = TruffleContract(SneakerArtifact);

            // Set the provider for our contract.
            App.contracts.Snkr.setProvider(App.web3Provider);

            $.getJSON('Sale.json', function(data) {
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
        $(document).on('click', '#validateSneaker', App.validateSneaker);
        App.grabState();
    },
    grabState: function() {
        var snkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
            console.log("this is the snkrInstance", snkrInstance);

            return snkrInstance.totalSupply.call();
        }).then(function(result){
            snkrListLen = result.toNumber();

            var promises = [];
            promises.push(snkrInstance.owner.call(), snkrInstance.name.call(), snkrInstance.symbol.call(), snkrInstance.sneaker_id());

            for (var i = 0; i < snkrListLen; i++) {
                promises.push(snkrInstance.tokenByIndex.call(i));
            }

            return Promise.all(promises);
        }).then(function(result) {
            //show the owner admin section if the person here is the owner
            if (web3.eth.accounts[0] == result[0]) $ownerSees_DIV.removeClass('hide');

            $sneakerAddress_SPAN.text(`Sneaker Address: ${snkrInstance.address}`);
            $ownerAddress_SPAN.text(`Owner of Contract: ${result[0]}`);
            $name_SPAN.text(`Name of Token: ${result[1]}`);
            $symbol_SPAN.text(`Token Symbol: ${result[2]}`);
            $sneaker_id_SPAN.text(`Sneaker Id: ${result[3]}`);

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
    validateSneaker: function(event) {
        event.preventDefault();
        var snkrInstance;
        var sneakerId = $sneakerIdInput.val()
        var currentOwnerAddress = $currentOwnerAddressInput.val()

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
            // console.log(snkrInstance);
            // console.log("snkrInstance.sneaker_id");
            // snkrInstance.sneaker_id().then(function(id) {
            //     console.log(id)
            // });

            return snkrInstance.validate(currentOwnerAddress, sneakerId);
        }).then(function(result) {
            var resultHTML
            var resultDescription

            if(result) {
                resultHTML = `<h3>Validation Result for sneaker ${sneakerId}: Valid</h3>`
                resultDescription = `<p>This item is owned by: ${currentOwnerAddress}</p>`
                $("#validationResults").attr('class', 'alert alert-success').html(resultHTML).append(resultDescription);
            } else {
                resultHTML = `<h3>Validation Result for sneaker ${sneakerId}: Not Valid</h3>`
                resultDescription = `<p>This item is not owned by: ${currentOwnerAddress}</p>`
                $("#validationResults").attr('class', 'alert alert-danger').html(resultHTML).append(resultDescription);
            }
        }).catch(function(err) {
            resultHTML = `<h3>Validation Result for sneaker ${sneakerId}: Not Valid</h3>`
            resultDescription = `<p>This item is not owned by: ${currentOwnerAddress}</p>`
            $("#validationResults").attr('class', 'alert alert-danger').html(resultHTML).append(resultDescription);
        });
    },
    mintSneaker: function(event) {
        event.preventDefault();
        var snkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
            return snkrInstance.mint($image_url_INPUT.val(), $sku_INPUT.val(), $upc_INPUT.val());
        }).then(function(result) {
            alert('Minting Successful!');
            console.log(result);
          
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
