pb = window.pb || {};

(function() {
    if (typeof pb.buysell != 'undefined') {
        return;
    }

    pb.buysell = { 
        delAd: function() {
            id =  this.getAttribute('data-id');
            if (confirm('It is better to simply mark ad sold instead of deleting, so buyers see your positive reputation.  Are you sure you want to delete?')==true){
                pb.rmsSend({ mod:'buysell', op:'delAd', id: id },pb.rmsReload);
            }
        },
        phoneAd: function() {
            id =  this.getAttribute('data-id');
            pb.rmsSend({ mod:'buysell', op:'phoneAd', id: id },function(oRmsD) {
                if (oRmsD.rmsS) {
                    pb.setHTML('#phoneAd', oRmsD.rmsD.phone);
                }
            });
        }
    }


})();
