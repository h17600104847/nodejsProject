var num = 0;
$(function () {
    $("#slogan p").eq(0).css({display:'block'});
    setInterval(function () {
        $("#slogan p").eq(num).stop().fadeIn(1500).siblings().css({display:'none'})
        num++;
        if (num == 5) {
            num = 0;
        }
    },3000)

    $('#loginPage').stop().fadeIn(1000)
    $('#regPage').stop().fadeIn(1000)
})