import { z } from "zod";


export const newTwitSnapSchema = z.object({
    message: z.string().max(280),
    createdBy: z.string().uuid(),
    isPrivate: z.boolean().default(false),
  });
  
  export const likeTwitSnapSchema = z.object({
    likedBy: z.string().uuid(),
  });
  
  export const snapshareTwitSnapSchema = z.object({
    sharedBy: z.string().uuid(),
  });
  
  export const feedSchema = z.object({
    timestamp_start: z.string().datetime(),
    limit: z.coerce.number().int(),
    followeds: z.array(z.string().uuid()),
  })
  
  export const mentionSchema = z.object({
    mentionedUser: z.string().uuid(),
  })
  
  export const hashtagSchema = z.object({
    hashtag: z.string().max(280),
  })
  
  export const searchTwitSchema = z.object( {
    q: z.string(),
  })
  
  export const editTwitSnapSchema = z.object({
    message: z.string().max(280),
    isPrivate: z.boolean().default(false),
  });
  

  export const statsSchema = z.object({
    limit: z.coerce.number().int(),
  });