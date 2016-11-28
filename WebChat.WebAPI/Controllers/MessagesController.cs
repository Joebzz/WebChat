using WebChat.WebAPI.Models;
using PusherServer;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Linq;

namespace WebChat.WebAPI.Controllers
{
    [EnableCors("*", "*", "*")]
    public class MessagesController : ApiController
    {
        private WebChatWebAPIContext db = new WebChatWebAPIContext();
        
        public HttpResponseMessage Get()
        {
            // Return all of the messages found on the database
            IQueryable<ChatMessage> messages = db.ChatMessages;
            return Request.CreateResponse(HttpStatusCode.OK, messages);
        }

        public HttpResponseMessage Post(ChatMessage message)
        {
            // Check to make sure the ModelState is valid before proceeding
            if (!ModelState.IsValid)
            {
                return Request.CreateResponse(BadRequest(ModelState));
            }
            // Check to ensure the message was passed in correctly and return an error if its not
            if (message == null)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "Invalid input");
            }

            // Create the pusher connection with credentials provided by my app on pusher
            var pusher = new Pusher(
                "273993",
                "44ecadbee9e7be8c5ffe",
                "40ee35748b52261c31db");

            // Trigger the pusher new_messgae event on the messages channel with the Message data
            pusher.Trigger(
                channelName: "messages",
                eventName: "new_message",
                data: new
                {
                    Username = message.Username,
                    Text = message.Text
                });

            // Save the Message to the database for history tracking
            db.ChatMessages.Add(message);
            db.SaveChanges();

            return Request.CreateResponse(HttpStatusCode.Created);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}