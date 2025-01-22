package com.project.chess_game.ChessGame.Repository;

import com.project.chess_game.ChessGame.Model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository <Room, Long> {
}
