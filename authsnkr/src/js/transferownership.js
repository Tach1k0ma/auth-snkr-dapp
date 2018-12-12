// JS for transferownership.html

var $transferToAddress_INPUT = $('#transferToAddress');

 //watch for a new owner from the ownable contract
            var snkrInstance;
             //watch for a solidity event
            App.contracts.Snkr.deployed().then(function(instance) {
                snkrInstance = instance;
                 return snkrInstance.OwnershipTransferred().watch(function(err, res){
                    if (err) console.log(err);
                    console.log(res.args.newOwner, res.args.previousOwner);
                    $('#ownerAddress').text(res.args.newOwner);
                });
             }).catch(function(err) {
                debugger;
                $errors_DIV.prepend(err.message);
            });
         //watch for a new token or a new owner
            var snkrInstance;
             //watch for a solidity event
            App.contracts.Snkr.deployed().then(function(instance) {
                snkrInstance = instance;
                 return snkrInstance.Transfer().watch(function(err, res){
                    if (err) console.log(err);
                     //if _from is 0x00... then the mint function was called 
                    //look at line 221 in ERC721BasicToken.sol
                    if (res.args._from == "0x0000000000000000000000000000000000000000"){
                        var owner = res.args._to;
                         var sneaker_id = res.args._tokenId.toNumber();
                         var snkrInstance;
                         App.contracts.Snkr.deployed().then(function(instance) {
                            snktInstance = instance;
                             return snkrInstance.dog_id_to_struct(sneaker_id);
                         }).then(function(result){
                             debugger;
                             $newSnkrDiv = createSnkrDiv(result[0], result[1], result[2], sneaker_id);
                             $snkrBody = $newSnkrDiv.children('div.card-body');
                            $p = $('<p>').addClass('card-text');
                            $p.text(`owner: ${owner}`);
                            $snkrBody.append($p);
                             $sneakers_DIV.append($newSnkrDiv);
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
    mintSneaker: function(event) {
        event.preventDefault();
         var snkrInstance;
         App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
        App.contracts.Snkr.deployed().then(function(instance) {
            snkrInstance = instance;
             var tAddressVal = $transferToAddress_INPUT.val();
             return snkrInstance.transferOwnership(tAddressVal);
            return snkrInstance.mint($image_url_INPUT.val(), $sku_INPUT.val(), $upc_INPUT.val());
        }).then(function(result) {
          addTransactionToDOM(result, $transactions_DIV);
           $ownerSeesAdditionalInfo_DIV.append($('<p>').text('ownership has been transferred to address provided.'));
         }).catch(function(err) {
            debugger;
            $errors_DIV.prepend(err.message);
        });
    }