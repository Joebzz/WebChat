using System.ComponentModel.DataAnnotations;

namespace WebChat.WebAPI.Models
{
    public class ChatMessage
    {
        public int ChatMessageID { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        public string Username { get; set; }        
    }
}