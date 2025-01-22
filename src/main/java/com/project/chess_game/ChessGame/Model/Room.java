package com.project.chess_game.ChessGame.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Room { // 방 만들기

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String roomName; // 방 이름
    private String password;
    private String player1; // 방에서 플레이할 플레이어 1
    private String player2; // 방에서 플레이할 플레이어 2

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPlayer1() {
        return player1;
    }

    public void setPlayer1(String player1) {
        this.player1 = player1;
    }

    public String getPlayer2() {
        return player2;
    }

    public void setPlayer2(String player2) {
        this.player2 = player2;
    }

    @Override
    public String toString() {
        return "Room{" +
                "id=" + id +
                ", roomName='" + roomName + '\'' +
                ", password='" + password + '\'' +
                ", player1='" + player1 + '\'' +
                ", player2='" + player2 + '\'' +
                '}';
    }
}
