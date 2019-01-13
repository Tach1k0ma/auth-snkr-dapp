var $snkrs_DIV = $('#transfer-ownership-container');
var $ownerSeesAdditionalInfo_DIV = $('#ownerSeesAdditionalInfo');
var $transactions_DIV = $('#transactions');
var $errors_DIV = $('#errors');
var $name_SPAN = $('#name');
var $symbol_SPAN = $('#symbol');
var $ownerAddress_SPAN = $('#address_owner');
var snkrListLen;

function snkrImgGen(image_url){
    var img = $('<img>');
    img.attr('src', image_url);
    img.addClass('imageTag mt-3');
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

function toggleSelect(sneakerId) {
    var selectedSneaker = $(`#card-${sneakerId}`)

    console.log(selectedSneaker)

    // if (selectedSneaker.classList.contains('selected')) {
    //     selectedSneaker.removeClass('selected')
    // } else {
        selectedSneaker.addClass('selected')
        $('#sneakerIdForTransfer').val(sneakerId)
    // }
}

function createSneakerDiv(image, sku, upc, sneakerId){
    var $cardContainer;
    var $cardBody;
    var $h5SKU;
    var $h5UPC;
    var $p_snkr_id_string;
    var $h5_snkr_id_num;

    $cardContainer = $(`<div id=card-${sneakerId} onClick='toggleSelect(${sneakerId})'>`).attr('class', 'card float-left justify-content-center text-center cardSNKR p-1');

    $cardBody = $('<div>').attr('class', 'card-body');

    $snkrImg = snkrImgGen(image);

    $h5SKU = $('<h5>').attr('class', 'card-title mt-2').text(`SKU: ${sku}`);
    $h5UPC = $('<h5>').attr('class', 'card-title').text(`UPC: ${upc}`);

    $p_snkr_id_num = $('<h5>').attr('class', 'card-text').text(`SNKR ID: ${sneakerId}`);

    var aft_id_text = afterIdText(sneakerId);

    $cardBody.append($snkrImg, $h5SKU, $h5UPC, $p_snkr_id_num);
    $cardContainer.append($cardBody);
    $cardContainer.attr('data-snkrId', sneakerId);
    return $cardContainer;
}

function addSneakersToPage(list, $id){
    $id.empty();
    var $snkrDiv;
   
    for (var i=list.length-1; i> -1; i--){
        $snkrDiv = createSneakerDiv(list[i][0], list[i][1], list[i][3]["c"][0], list[i][4]["c"][0]);
        $id.append($snkrDiv);
    }
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
        $(document).on('click', '#transferOwnership', App.transferOwnership);
        App.grabState();
    },
    grabState: function() {
        var snkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
            console.log("this is the snkrInstance", snkrInstance);

            return snkrInstance.totalSupply.call();

            //totalSupply is a contract function that returns the number of tokens
            //allTokens is an array
            // function totalSupply() public view returns (uint256) {
            //   return allTokens.length;
            // }

        }).then(function(result){

            snkrListLen = result.toNumber(); //store the number of the sneakers

            var promises = [];

            //get the owner address, the sneaker name, and the symbol
            promises.push(snkrInstance.owner.call(), snkrInstance.name.call(), snkrInstance.symbol.call());

            for (var i = 0; i < snkrListLen; i++) {
                promises.push(snkrInstance.tokenByIndex.call(i));
            }

            //tokenByIndex returns a token id at a given index in the array
            // function tokenByIndex(uint256 _index) public view returns (uint256) {
            //   require(_index < totalSupply());
            //   return allTokens[_index];
            // }

            return Promise.all(promises);

        }).then(function(result) {
//-------------------------------------------------------------------------------------------------
            //show the owner admin section if the person here is the owner
            /*if (web3.eth.accounts[0] == result[0]) $ownerSees_DIV.removeClass('hide');

            $ownerAddress_SPAN.text(result[0]);
            $name_SPAN.text(result[1]);
            $symbol_SPAN.text(result[2]);*/
//--------------------------------------------------------------------------------------------
            //update dogTokens globally
            snkrTokenIds = result.slice(3);

            var promises = [];

            for (var i = 0; i < snkrTokenIds.length; i++) {
                promises.push(snkrInstance.sneaker_id_to_struct(snkrTokenIds[i].toNumber()));
            }

            // snkrTokenIds[i].toNumber() give us the sneaker id (which is the token)
            //sneaker_id_to_struct(snkrTokenIds[i].toNumber()) gives us the struct of the sneaker ex: sku, upc etc.

            return Promise.all(promises);

        }).then(function(result) {
            var snkrTokens = result;

            addSneakersToPage(snkrTokens, $snkrs_DIV);

        }).catch(function(err) {

            // $errors_DIV.prepend(err.message);
            console.log(err.message)
        });
    },
    //-----------------------------------------------------------------------------------------
    /*transferOwnership: function(event) {
        event.preventDefault();

        var SnkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            SnkrInstance = instance;

            var tAddressVal = $transferToAddress_INPUT.val();

            return SnkrInstance.transferOwnership(tAddressVal);
        }).then(function(result) {
          addTransactionToDOM(result, $transactions_DIV);

          $ownerSeesAdditionalInfo_DIV.append($('<p>').text('ownership has been transferred to address provided.'));

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });
    }*/
    //---------------------------------------------------------------------------------------------
    watchEvents: function() {
        //we'll set up watching events here
        //watch for a new auction
        var SaleInstance;

        //watch for a solidity event
        App.contracts.Sale.deployed().then(function(instance) {
            console.log('App.contracts.Sale.deployed().then(function(instance) {')
            console.log(instance)
            SaleInstance = instance;

            return SaleInstance.NewAuction().watch(function(err, res){
                console.log(res)
                if (err) console.log(err);
                console.log(res.args.seller, res.args.price, res.args.token_id);
            });

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });

        //watch for a new owner from the ownable contract
        var SnkrInstance;

        //watch for a solidity event
        App.contracts.Snkr.deployed().then(function(instance) {
            console.log('App.contracts.Snkr.deployed().then(function(instance) {')
            console.log(instance)
            SnkrInstance = instance;

            return SnkrInstance.OwnershipTransferred().watch(function(err, res){
                console.log(res)
                if (err) console.log(err);
                console.log(res.args.newOwner, res.args.previousOwner);
                $('#ownerAddress').text(res.args.newOwner);
            });

        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });

        //watch for a new token or a new owner
        var SnkrInstance;

        //watch for a solidity event
        App.contracts.Snkr.deployed().then(function(instance) {
            SnkrInstance = instance;

            return SnkrInstance.Transfer().watch(function(err, res){
                if (err) console.log(err);

                //if _from is 0x00... then the mint function was called 
                //look at line 221 in ERC721BasicToken.sol
                if (res.args._from == "0x0000000000000000000000000000000000000000"){
                    var owner = res.args._to;
                    var snkr_id = res.args._tokenId.toNumber();
                    var SnkrInstance;

                    App.contracts.Snkr.deployed().then(function(instance) {
                        SnkrInstance = instance;

                        return SnkrInstance.sneaker_id_to_struct(snkr_id);
                    }).then(function(result){
                    //---------------------------------------------------------------
                        /*if (appStates == "init") {
                            appStates = "Initialized";
                            return;
                        }*/
                    //---------------------------------------------------------------
                        $newSnkrDiv = createSneakerDiv(result[0], result[1], result[2], snkr_id);

                        $snkrBody = $newSnkrDiv.children('div.card-body');
                        $p = $('<p>').addClass('card-text');
                        $p.text(`owner: ${owner}`);
                        $snkrBody.append($p);

                        $snkrs_DIV.append($newSnkrDiv);
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
        console.log('transferOwnership')
        event.preventDefault();

        var SnkrInstance;

        App.contracts.Snkr.deployed().then(function(instance) {
            console.log(instance)
            SnkrInstance = instance;

            var transferToAddress = $('#transferToAddress').val();
            var sneakerIdForTransfer = $('#sneakerIdForTransfer').val();

            return SnkrInstance.transferOwnership(sneakerIdForTransfer, transferToAddress);
        }).then(function(result) {
            console.log(result)
            addTransactionToDOM(result, $transactions_DIV);
            $ownerSeesAdditionalInfo_DIV.append($('<p>').text(`ownership of Token has been transferred to address: ${transferToAddress}`));
        }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });
    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});
