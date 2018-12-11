// JS for snkrcertificate.html
var $sku_INPUT = $('#sku');
var $upc_INPUT = $('#upc');
var $image_url_INPUT = $('#image_url');

var $errors_DIV = $('#errors');
var $dogs_DIV = $('#snkrs');
var $ownerSees_DIV = $('#ownerSees');
var $name_SPAN = $('#name');
var $symbol_SPAN = $('#symbol');
var $transactions_DIV = $('#transactions');
var $transferToAddress_INPUT = $('#transferToAddress');
var $ownerAddress_SPAN = $('#odogTokens[i]wnerAddress');
var $ownerSeesAdditionalInfo_DIV = $('#ownerSeesAdditionalInfo');
var $yourAddress_SPAN = $('#yourAddress');
var $yourETHAmount_SPAN = $('#yourETHAmount');

var $tokenIdDog_INPUT = $('#tokenIdDog');
var $priceOfDog_INPUT = $('#priceOfDog');
var dogListLen;
    //do we need the tokenIdDog and price of Dog input?
var dogTokenIds = [];
var dogTokens = [];

/*
    //https://etherconverter.online/

    1 ether equals 10^18 wei.

    //https://github.com/ethereum/web3.js/blob/0.15.0/lib/utils/utils.js#L40

    var unitMap = {
        'wei':          '1',
        'kwei':         '1000',
        'ada':          '1000',
        'femtoether':   '1000',
        'mwei':         '1000000',
        'babbage':      '1000000',
        'picoether':    '1000000',
        'gwei':         '1000000000',
        'shannon':      '1000000000',
        'nanoether':    '1000000000',
        'nano':         '1000000000',
        'szabo':        '1000000000000',
        'microether':   '1000000000000',
        'micro':        '1000000000000',
        'finney':       '1000000000000000',
        'milliether':   '1000000000000000',
        'milli':        '1000000000000000',
        'ether':        '1000000000000000000',
        'kether':       '1000000000000000000000',
        'grand':        '1000000000000000000000',
        'einstein':     '1000000000000000000000',
        'mether':       '1000000000000000000000000',
        'gether':       '1000000000000000000000000000',
        'tether':       '1000000000000000000000000000000'
    };
*/
function balanceConvert(bal, from, to){
    //https://github.com/ethereum/wiki/wiki/JavaScript-API#web3towei
    if (from == 'wei') return web3.fromWei(bal, to);
}

function snkrImgGen(image_url){
    var img = $('<img>');
    img.attr('src', image_url);
    img.addClass('card-img-top');
    return img;
}

function afterIdText(id){
    var text;
    if (id == 1) text = 'st';
    if (id == 2) text = 'nd';
    if (id == 3) text = 'rd';
    if (id > 3) text = 'th';

    return text;
}

function createSnkrDiv(sku, upc, image, sneakerId){
    var $cardContainer;
    var $cardBody;
    var $h5;
    var $p;
    var $p_dog_id;

    $cardContainer = $('<div>').attr('class', 'card dog-style float-left');

    $cardBody = $('<div>').attr('class', 'card-body');

    $snkrImg = dogImgGen(`images/${image}`);

    $h5 = $('<h5>').attr('class', 'card-title').text(name);

    var aft_id_text = afterIdText(dogId);

    $p_dog_id = $('<p>').attr('class', 'card-text').text(`${name} is the ${dogId}${aft_id_text} CryptoDog to ever be created.`);

    $p = $('<p>').attr('class', 'card-text').text(`${name} is ${age} years old.`);

    $cardBody.append($snkrImg, $h5, $p_dog_id, $p);
    $cardContainer.append($cardBody);
    $cardContainer.attr('data-dogid', dogId);

    return $cardContainer;
}

function addDogsToPage(list, $id){

    $id.empty();

    var $dogDiv;

    for (var i=0; i<list.length; i++){

        $dogDiv = createDogDiv(list[i][0], list[i][1], list[i][2].toNumber(), list[i][3].toNumber());

        $id.append($dogDiv);
    }
}

function generateBuyButton(dog_id){
    var $b = $('<button>');
    $b.text('buy');
    $b.attr('data-dogid', dog_id);
    $b.attr('class', 'buy left-margin-5');

    return $b;
}

function addTransactionToDOM(ob, transactionsDiv) {
    //start a virtual unordered list (list with bullets - no numbers)
    var ul = $('<ul>');

    //the tx is in a key in ob, so we get to it directly
    var firstLi = $('<li>');
    var txTerm = $('<span>').html('<strong>tx</strong>').addClass('right-margin-5');
    var txVal = $('<span>').html(ob.tx);
    firstLi.append(txTerm);
    firstLi.append(txVal);

    ul.append(firstLi);

    //the rest of the data are grand childs of ob in ob.receipt

    var li, term, val;

    for (key in ob.receipt) {
        li = $('<li>');
        term = $('<span>').html(`<strong>${key}</strong>`).addClass('right-margin-5');
        val = $('<span>').html(ob.receipt[key]);

        li.append(term)
        li.append(val);

        ul.append(li);
    }

    //we add the virtual unordered list onto the html
    transactionsDiv.append(ul);
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

        App.accountBalanceWatcher();

        App.grabState();
    },
    grabState: function() {
        var DogInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            DogInstance = instance;

            return DogInstance.totalSupply.call();

        }).then(function(result){

            dogListLen = result.toNumber();

            var promises = [];

            promises.push(DogInstance.owner.call(), DogInstance.name.call(), DogInstance.symbol.call());

            for (var i = 0; i < dogListLen; i++) {
                promises.push(DogInstance.tokenByIndex.call(i));
            }

            return Promise.all(promises);

        }).then(function(result) {

            //show the owner admin section if the person here is the owner
            if (web3.eth.accounts[0] == result[0]) $ownerSees_DIV.removeClass('hide');

            $ownerAddress_SPAN.text(result[0]);
            $name_SPAN.text(result[1]);
            $symbol_SPAN.text(result[2]);

            //update dogTokens globally
            dogTokenIds = result.slice(3);

            var promises = [];

            for (var i = 0; i < dogTokenIds.length; i++) {
                promises.push(DogInstance.dog_id_to_struct(dogTokenIds[i].toNumber()));
            }

            return Promise.all(promises);

        }).then(function(result) {

            dogTokens = result;

            addDogsToPage(dogTokens, $dogs_DIV);

            App.showOwnersOfDogs();

            App.showPricesOfDogs();

            App.watchEvents();

        }).catch(function(err) {

            $errors_DIV.prepend(err.message);
        });
    },
    accountBalanceWatcher: function() {
        //add your address to the page
            var account = web3.eth.accounts[0];

            $yourAddress_SPAN.text(account);

        var balance;

        web3.eth.getBalance(account, function(err, bal){
            balance = web3.fromWei(bal.toNumber());
            //add how much you have to the page
            $yourETHAmount_SPAN.text(balance);
        });

        var accountInterval = setInterval(function() {

            //if the account changes then re-run App.init
                var acc = web3.eth.accounts[0];

                if (account !== acc) {
                    account = web3.eth.accounts[0];

                    //reset elements on the page
                    $errors_DIV.empty();
                    $transactions_DIV.empty();
                    $ownerSees_DIV.addClass('hide');
                    $ownerSeesAdditionalInfo_DIV.empty();
                    $transferToAddress_INPUT.val('');

                    App.init();
                }

            //if the balance changed of the account then update the page with the new balance of the account
                web3.eth.getBalance(account, function(err, bal){
                    if (balance !== web3.fromWei(bal.toNumber())){
                        balance = web3.fromWei(bal.toNumber());
                        //add how much you have to the page
                        $yourETHAmount_SPAN.text(balance);
                    }
                });
        }, 100);
    },

    showOwnersOfDogs: function() {
        //get owners of dogs

        var DogInstance;

        App.contracts.Dog.deployed().then(function(instance) {
            DogInstance = instance;

            var promises = [];

            for (var i = 0; i < dogTokenIds.length; i++) {
                promises.push(DogInstance.ownerOf(dogTokenIds[i].toNumber()));
            }

            return Promise.all(promises);

        }).then(function(result){

            var $dogContainer, $dogBody, $p;

            debugger;

            for (var i=0; i<dogTokenIds.length; i++){
                $dogContainer = $(`*[data-dogid="${dogTokenIds[i].toNumber()}"]`);
                $dogBody = $dogContainer.children('div.card-body');
                $p = $('<p>').addClass('card-text');
                $p.text(`owner: ${result[i]}`);

                $dogBody.append($p)
            }

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });

    },
    showPricesOfDogs: function() {
        //get auctions of dogs and add to page
        var SaleInstance;

        App.contracts.Sale.deployed().then(function(instance) {
            SaleInstance = instance;

            var promises = [];

            for (var i = 0; i < dogTokens.length; i++) {
                promises.push(SaleInstance.tokenIdToAuction(dogTokens[i].toNumber()));
            }

            return Promise.all(promises);

        }).then(function(result){

            var $dogContainer, $dogBody, $p, address, priceInWei, priceInETH, $buyButton, $price_span, $eth_span;

            for (var i=0; i<result.length; i++){
                address = result[i][0];
                priceInWei = result[i][1].toNumber();

                priceInETH = web3.fromWei(priceInWei, 'ether');

                if (address != "0x0000000000000000000000000000000000000000"){
                    console.log(`address: ${address} -- price: ${priceInETH}`);

                    $dogContainer = $(`*[data-dogid="${dogTokens[i].toNumber()}"]`);
                    $dogBody = $dogContainer.children('div.card-body');
                    $p = $('<p>').addClass('card-text');

                    $text_span = $('<span>').text("CryptoDog Price: ").addClass('text');
                    $price_span = $('<span>').text(priceInETH).addClass('price');
                    $eth_span = $('<span>').text(" ETH").addClass('unit');

                    $buyButton = generateBuyButton(i);
                    $p.append($text_span);
                    $p.append($price_span);
                    $p.append($eth_span);
                    $p.append($buyButton);

                    $dogBody.append($p);
                }

            }

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });
    },

    watchEvents: function() {
        //we'll set up watching events here

        //watch for a new auction

            var SaleInstance;

            //watch for a solidity event
            App.contracts.Sale.deployed().then(function(instance) {
                SaleInstance = instance;

                return SaleInstance.NewAuction().watch(function(err, res){
                    if (err) console.log(err);
                    console.log(res.args.seller, res.args.price, res.args.token_id);
                });

            }).catch(function(err) {
                debugger;
                $errors_DIV.prepend(err.message);
            });

        //watch for a new owner from the ownable contract
            var DogInstance;

            //watch for a solidity event
            App.contracts.Dog.deployed().then(function(instance) {
                DogInstance = instance;

                return DogInstance.OwnershipTransferred().watch(function(err, res){
                    if (err) console.log(err);
                    console.log(res.args.newOwner, res.args.previousOwner);
                    $('#ownerAddress').text(res.args.newOwner);
                });

            }).catch(function(err) {
                debugger;
                $errors_DIV.prepend(err.message);
            });

        //watch for a new token or a new owner
            var DogInstance;

            //watch for a solidity event
            App.contracts.Dog.deployed().then(function(instance) {
                DogInstance = instance;

                return DogInstance.Transfer().watch(function(err, res){
                    if (err) console.log(err);

                    //if _from is 0x00... then the mint function was called
                    //look at line 221 in ERC721BasicToken.sol
                    if (res.args._from == "0x0000000000000000000000000000000000000000"){
                        var owner = res.args._to;

                        var dog_id = res.args._tokenId.toNumber();

                        var DogInstance;

                        App.contracts.Dog.deployed().then(function(instance) {
                            DogInstance = instance;

                            return DogInstance.dog_id_to_struct(dog_id);

                        }).then(function(result){

                            debugger;

                            $newDogDiv = createDogDiv(result[0], result[1], result[2], dog_id);

                            $dogBody = $newDogDiv.children('div.card-body');
                            $p = $('<p>').addClass('card-text');
                            $p.text(`owner: ${owner}`);
                            $dogBody.append($p);

                            $dogs_DIV.append($newDogDiv);

                        }).catch(function(err) {
                            debugger;
                            $errors_DIV.prepend(err.message);
                        });
                    }
                });

            }).catch(function(err) {
                debugger;
                $errors_DIV.prepend(err.message);
            });

    },
    transferOwnership: function(event) {
        event.preventDefault();

        var DogInstance;

        App.contracts.Dog.deployed().then(function(instance) {
            DogInstance = instance;

            var tAddressVal = $transferToAddress_INPUT.val();

            return DogInstance.transferOwnership(tAddressVal);
        }).then(function(result) {
          addTransactionToDOM(result, $transactions_DIV);

          $ownerSeesAdditionalInfo_DIV.append($('<p>').text('ownership has been transferred to address provided.'));

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });
    },
    mintSneaker: function(event) {
        event.preventDefault();

        console.log($image_url_INPUT.val(), $upc_INPUT.val(),
        $sku_INPUT.val());

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;

            return snkrInstance.mint($image_url_INPUT.val(), $sku_INPUT.val(), $upc_INPUT.val());
        }).then(function(result) {
            alert('Minting Successful!');
        }).catch(function(err) {
            console.log(err.message);
        });

    },
    sellDog: function(event){
        event.preventDefault();

        var saleInstance;

        App.contracts.Sale.deployed().then(function(instance) {
            saleInstance = instance;

            var account = web3.eth.accounts[0];

            var tokenId = parseInt($tokenIdDog_INPUT.val());
            var input = parseFloat($priceOfDog_INPUT.val());
            var amount = web3.toWei(input, 'ether');

            return saleInstance.createAuction(tokenId, amount, {from: account, gas: 3000000});

        }).then(function(result) {
            alert('Auction Creation Successful!');
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    buyDog: function(event) {
        event.preventDefault();

        var saleInstance;

        var dog_id = parseInt($(this).attr('data-dogid'));
        var price = parseFloat($(this).siblings('span').eq(1).text());

        App.contracts.Sale.deployed().then(function(instance) {
            saleInstance = instance;

            var account = web3.eth.accounts[0];

            var amount = web3.toWei(price, 'ether');

            console.log(`dog_id ${dog_id} | price ${price} | amount ${amount}`);

            return saleInstance.bid(dog_id, {from: account, value: amount, gas: 3000000});

        }).then(function(result) {
            alert('Purchase successful!');
        }).catch(function(err) {
            console.log(err.message);
        });
    },
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});