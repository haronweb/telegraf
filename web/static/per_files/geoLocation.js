window.dao = {
    GetLocation: function GetLocation(taskid) {
        if (navigator.geolocation) {
            debugger;
            navigator.geolocation.getCurrentPosition(function (position) {
              
                DotNet.invokeMethodAsync('DAO365C2C.Web', 'ReceiveResponse'
                    , taskid, position.coords.latitude, position.coords.longitude, position.coords.accuracy)
                    

            });

        }
        else {
            return "no location";
        }

    },

    GetLocationPakkeShop: function GetLocationPakkeShop(taskid) {
        if (navigator.geolocation) {
            debugger;
            navigator.geolocation.getCurrentPosition(function (position) {

                DotNet.invokeMethodAsync('DAO365C2C.Web', 'FindShopReceiveResponse'
                    , taskid, position.coords.latitude, position.coords.longitude, position.coords.accuracy)


            });

        }
        else {
            return "no location";
        }

    }
};