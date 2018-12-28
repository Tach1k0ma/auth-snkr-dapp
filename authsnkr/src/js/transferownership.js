var $snkrs_DIV = $('#transfer-ownership-container');

function createSnkrDiv(sku, upc, image, sneakerId){
  var $card =
  $(`<div class="card mr-5" style="width: 18rem;">
      <img class="card-img-top" src=${image} alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">Token ID: ${sneakerId}</h5>
        <p class="card-text">SKU: ${sku}</p>
        <p class="card-text">UPC: ${upc}</p>
        <a href="#" class="btn btn-primary">Transfer</a>
      </div>
    </div>`);

  return $card;
}

function addSneakersToPage(list, $id){

  $id.empty();

  var $snkrDiv;
  debugger

  for (var i=0; i<list.length; i++){
    var imageURL = list[i][0];
    var sku = list[i][1];
    var createdDate = list[i][2].toNumber();
    var upc = list[i][3].toNumber();
    var TokenID = list[i][4].toNumber();

    $snkrDiv = createSnkrDiv(sku, upc, imageURL, TokenID);

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
    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});