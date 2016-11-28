using WebChat.WebAPI.Models;
using PusherServer;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Linq;
using System.Web.Http.Description;

namespace WebChat.WebAPI.Controllers
{
    [EnableCors("*", "*", "*")]
    public class MessagesController : ApiController
    {
        private WebChatWebAPIContext db = new WebChatWebAPIContext();
        
        public HttpResponseMessage Get()
        {
            IQueryable<ChatMessage> messages = db.ChatMessages;
            return Request.CreateResponse(HttpStatusCode.OK, messages);
        }

        public HttpResponseMessage Post(ChatMessage message)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateResponse(BadRequest(ModelState));
            }

            if (message == null || !ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "Invalid input");
            }

            var pusher = new Pusher(
                "273993",
                "44ecadbee9e7be8c5ffe",
                "40ee35748b52261c31db");
            pusher.Trigger(
                channelName: "messages",
                eventName: "new_message",
                data: new
                {
                    Username = message.Username,
                    Text = message.Text
                });

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