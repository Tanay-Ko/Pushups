-- Drop pushup milestone trigger and function so only friend request notifications exist
DROP TRIGGER IF EXISTS trigger_pushup_milestone ON public.pushups;
DROP FUNCTION IF EXISTS handle_pushup_milestone();

-- Delete existing milestone notifications
DELETE FROM public.notifications WHERE type = 'milestone';

-- Friend request notification trigger remains intact and active
CREATE OR REPLACE FUNCTION handle_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- When request is sent (status = 'pending') -> Notify the receiver (addressee_id)
  IF (TG_OP = 'INSERT' AND NEW.status = 'pending') THEN
    SELECT username INTO v_username FROM public.profiles WHERE id = NEW.requester_id;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.addressee_id AND notify_friend_requests = true) THEN
      INSERT INTO public.notifications (user_id, actor_id, type, content)
      VALUES (NEW.addressee_id, NEW.requester_id, 'friend_request_received', v_username || ' sent you a friend request!');
    END IF;
  END IF;

  -- When request is accepted (status changes to 'accepted') -> Notify the sender (requester_id)
  IF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted') THEN
    SELECT username INTO v_username FROM public.profiles WHERE id = NEW.addressee_id;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.requester_id AND notify_friend_requests = true) THEN
      INSERT INTO public.notifications (user_id, actor_id, type, content)
      VALUES (NEW.requester_id, NEW.addressee_id, 'friend_request_accepted', v_username || ' accepted your friend request!');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
