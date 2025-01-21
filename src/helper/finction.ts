// const handleSignUp: SubmitHandler<FormInputs> = async ({ email, password, displayName }: FormInputs) => {
  //   setErrorMessage('');
  //   try {
  //     // Sign up the user
  //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           display_name: displayName || '',
  //         },
  //       },
  //     });
  
  //     if (signUpError) throw signUpError;
  
  //     // Extract user ID from the signed-up user
  //     const userId = signUpData.user?.id;
  //     if (!userId) throw new Error('User ID not found during sign-up.');
  
  //     // Insert user information into the custom "users" table
  //     const { error: insertError } = await supabase.from('users').insert([
  //       {
  //         id: userId, // Use the user ID from the authentication system
  //         email,
  //         display_name: displayName || '',
  //         role: 'user', // Default role
  //       },
  //     ]);
  
  //     if (insertError) throw insertError;
  
  //     // Show success message and reset form
  //     toast.success('Sign-up successful! Please log in.', { position: 'top-center' });
  //     setIsLoginMode(true);
  //     reset();
  //   } catch (error: any) {
  //     setErrorMessage(error.message);
  //   }
  // };
  