import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailManager {
  static async sendInviteEmail(
    email: string,
    projectName: string,
    inviteLink: string,
    invitedBy: string
  ) {
    try {
      await resend.emails.send({
        from: 'Pensif Canvas <notifications@pensifcanvas.com>',
        to: email,
        subject: `You've been invited to collaborate on ${projectName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6d28d9;">Join ${projectName} on Pensif Canvas</h1>
            
            <p style="color: #525252; font-size: 16px; line-height: 1.5;">
              ${invitedBy} has invited you to collaborate on their project "${projectName}" using Pensif Canvas.
            </p>

            <div style="margin: 32px 0;">
              <a href="${inviteLink}"
                style="
                  background-color: #6d28d9;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                "
              >
                Accept Invitation
              </a>
            </div>

            <p style="color: #525252; font-size: 14px;">
              If you can't click the button, copy and paste this link into your browser:
              <br>
              <a href="${inviteLink}" style="color: #6d28d9;">${inviteLink}</a>
            </p>

            <hr style="border: none; border-top: 1px solid #d4d4d4; margin: 32px 0;">

            <p style="color: #737373; font-size: 14px;">
              This invitation was sent from Pensif Canvas, the AI-powered collaborative canvas for creative exploration.
            </p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Failed to send invite email:', error)
      throw error
    }
  }

  static async sendCommentNotification(
    email: string,
    projectName: string,
    commenterName: string,
    commentText: string,
    projectLink: string
  ) {
    try {
      await resend.emails.send({
        from: 'Pensif Canvas <notifications@pensifcanvas.com>',
        to: email,
        subject: `New comment on ${projectName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6d28d9;">New Comment on ${projectName}</h1>
            
            <p style="color: #525252; font-size: 16px; line-height: 1.5;">
              ${commenterName} commented on your project "${projectName}":
            </p>

            <div style="
              background-color: #262626;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              color: #e5e5e5;
              font-size: 16px;
              line-height: 1.5;
            ">
              ${commentText}
            </div>

            <div style="margin: 32px 0;">
              <a href="${projectLink}"
                style="
                  background-color: #6d28d9;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                "
              >
                View Comment
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #d4d4d4; margin: 32px 0;">

            <p style="color: #737373; font-size: 14px;">
              You received this notification because you're collaborating on ${projectName} in Pensif Canvas.
            </p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Failed to send comment notification:', error)
      throw error
    }
  }
}
