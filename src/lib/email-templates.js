/**
 * Email templates for waitlist notifications
 */

/**
 * Default welcome email template for waitlist users
 * @param {string} email - User email
 * @returns {string} - HTML email content
 */
export function getWaitlistWelcomeEmail(email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BZGamers Waitlist</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BZGamers! 🎮</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi there!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thanks for joining the BZGamers waitlist! We're excited to have you on board.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We're building something special to help gamers like you find the perfect game for your mood, available time, and preferences. Plus, we're working on features to help you connect with like-minded gamers.
        </p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0; font-style: italic; color: #666;">
            "Only have 20 minutes and want to relax? We'll recommend cozy puzzle games."
          </p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We'll notify you as soon as the feature launches. In the meantime, feel free to explore our game recommendations at <a href="https://bzgamers.com" style="color: #667eea;">bzgamers.com</a>!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Happy gaming! 🎮
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          — The BZGamers Team
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
        <p>You're receiving this because you signed up for the BZGamers waitlist.</p>
        <p>If you didn't sign up, please ignore this email.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Automatic welcome email sent when joining waitlist
 * @param {string} email - User email
 * @param {string} name - User name (optional)
 * @returns {string} - HTML email content
 */
export function getWaitlistAutoWelcomeEmail(email, name = null) {
  const greeting = name ? `Hi ${name}!` : 'Hi there!'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanks for Joining BZGamers Waitlist</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thanks for Joining! 🎮</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          ${greeting}
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for joining the BZGamers waitlist! We're thrilled to have you on board.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          You've signed up with: <strong>${email}</strong>
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We're building something special to help gamers like you find the perfect game for your mood, available time, and preferences. Plus, we're working on exciting features to help you connect with like-minded gamers.
        </p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #667eea; margin-bottom: 10px;">
            Want to be first in line?
          </p>
          <p style="margin: 0; color: #666;">
            Create a free account now to get early access to new features and be among the first to try them out when they launch!
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://bzgamers.com" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-bottom: 10px;">
            Create Your Account
          </a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          In the meantime, feel free to explore our game recommendations and find your next favorite game at <a href="https://bzgamers.com" style="color: #667eea; text-decoration: none;">bzgamers.com</a>!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We'll keep you updated on our progress and notify you as soon as new features are ready.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Happy gaming! 🎮
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          — The BZGamers Team
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
        <p>You're receiving this because you signed up for the BZGamers waitlist.</p>
        <p>If you didn't sign up, please ignore this email.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Default notification email template when feature launches
 * @param {string} email - User email
 * @returns {string} - HTML email content
 */
export function getFeatureLaunchEmail(email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BZGamers Feature Launch!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">It's Here! 🎉</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          The feature you've been waiting for is now live! You can now connect with like-minded gamers on BZGamers.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://bzgamers.com" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Get Started Now
          </a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We're excited to have you join our community of gamers who value chill vibes and great gaming experiences.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          See you there! 🎮
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          — The BZGamers Team
        </p>
      </div>
    </body>
    </html>
  `
}

