document.addEventListener("DOMContentLoaded", function() {
    // Thymeleaf에서 로그인 여부 가져오기
    const isLoggedIn  = false;
    const createRoomBtn = document.querySelector("#createRoomBtn");

    if(createRoomBtn) {
      createRoomBtn.addEventListener("click", function(event){
        if (!isLoggedIn) {
         event.preventDefault();
         alert("방문해주셔서 감사합니다! 계정 생성 후 로그인 먼저 해주세요");
      } else {
          window.location.href="/Room";
      }
   });
  }
   const notLoggedIn = false;
   if(notLoggedIn) {
     alert("로그인 먼저 해주세요");
   }
});