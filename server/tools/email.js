export async function send_email(args) {
  const { to, subject = 'No Subject', body } = args;
  
  if (!to || !to.length) throw new Error("Recipient 'to' is required");
  if (!body) throw new Error("Email 'body' is required");

  console.log(`[TOOL: send_email] Sending email to ${to.join(', ')}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return `Email successfully sent to ${to.join(', ')}.\nSubject: ${subject}\nBody preview: ${body.substring(0, 50)}...`;
}

export async function draft_email(args) {
  const { to, subject = 'No Subject', body = '' } = args;
  
  if (!to || !to.length) throw new Error("Recipient 'to' is required");

  console.log(`[TOOL: draft_email] Drafting email for ${to.join(', ')}...`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return `Email draft created for ${to.join(', ')}.\nSubject: ${subject}`;
}
