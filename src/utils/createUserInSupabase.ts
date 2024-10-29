import { supabase } from '@/lib/supabase';

type UserData = {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
  }>;
};

export async function createUserInSupabase(user: UserData) {
  const { error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
    });

  if (error) {
    console.error('Error creating user in Supabase:', error);
    throw error;
  }
}
