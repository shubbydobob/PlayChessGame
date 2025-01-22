document.addEventListener("DOMContentLoaded", function() {
    const createRoomBtn = document.querySelector("#createRoomBtn");

    if (createRoomBtn) {
        createRoomBtn.addEventListener("click", function(event) {
            if (!isLoggedIn) {
                event.preventDefault();
                alert("방문해주셔서 감사합니다! 계정 생성 후 로그인 먼저 해주세요");
            } else {
                window.location.href = "/Room";
            }
        });
    }
});