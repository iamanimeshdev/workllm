export async function schedule_meeting(args) {
  const { participants, duration_minutes = 30, date, time_preference, agenda, selected_slot } = args;
  
  if (!participants || !participants.length) throw new Error("Participants are required to schedule a meeting");

  console.log(`[TOOL: schedule_meeting] Scheduling meeting with ${participants.join(', ')}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  let timeStr = selected_slot ? selected_slot : `${date || 'TBD'} ${time_preference || ''}`;
  
  return `Successfully scheduled a ${duration_minutes}-minute meeting with ${participants.join(', ')} for ${timeStr.trim()}.\nAgenda: ${agenda || 'Not specified'}`;
}
