package models;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * The type Message.
 * It represents a message, that two users can send each other
 */
public class Message {
    private final int sender;
    private final int receiver;
    private final String time;
    private final String message_text;
    private String senderName;
    private String receiverName;

    /**
     * Instantiates a new Message.
     *
     * @param rs the rs
     * @throws SQLException the sql exception
     */
    public Message(ResultSet rs) throws SQLException {
        this.sender = rs.getInt("sender");
        this.receiver = rs.getInt("receiver");
        this.time = rs.getString("time");
        this.message_text = rs.getString("message_text");
    }

    /**
     * Gets sender.
     *
     * @return the sender
     */
    public int getSender() {
        return sender;
    }

    /**
     * Gets receiver.
     *
     * @return the receiver
     */
    public int getReceiver() {
        return receiver;
    }

    /**
     * Gets sender name.
     *
     * @return the sender name
     */
    public String getSenderName() {
        return senderName;
    }

    /**
     * Sets sender name.
     *
     * @param senderName the sender name
     */
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    /**
     * Gets receiver name.
     *
     * @return the receiver name
     */
    public String getReceiverName() {
        return receiverName;
    }

    /**
     * Sets receiver name.
     *
     * @param receiverName the receiver name
     */
    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    /**
     * Gets time.
     *
     * @return the time
     */
    public String getTime() {
        return time;
    }

    /**
     * Gets message text.
     *
     * @return the message text
     */
    public String getMessage_text() {
        return message_text;
    }
}
