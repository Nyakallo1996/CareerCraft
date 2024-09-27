import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import path from "path";
import { UploadedFile } from "express-fileupload";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  
  let profilePicture = "https://i0.wp.com/vssmn.org/wp-content/uploads/2018/12/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png?fit=860%2C681&ssl=1";

  try {
    if (req.files && req.files.profilePicture) {
      let file = req.files.profilePicture as UploadedFile;
  
      const uploadPath = path.join(__dirname, '../public/img', file.name);
  
      await file.mv(uploadPath, (error) => {
        if (error) return res.status(500).send(error);
      });
  
      profilePicture = `/img/${file.name}`;
    }

    if (!name || !email || !password || !role) {
      return res.status(406).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: hashedPassword, role, profilePicture });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET , { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", userToken: token, user: newUser });
  } catch (error) {
    if (error) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    console.log(error);
    res.status(500).json({ error: "Server error, failed to create a new user" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const foundUsers = await User.find();

    res.status(200).json({ message: "Users found", users: foundUsers })
  } catch (error) {
    console.log(error);
  }
}

export async function findUser(req: Request, res: Response) {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid user ID format" });
    return;
  }
  try {
    const foundUser = await User.findById(id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User found", user: foundUser } )
  } catch (error) {
    res.status(500).json({ message: "Server error, failed to fetch user" });
  }
}

export async function editUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const editedUser = await User.findByIdAndUpdate(id, { name, email, password, role });

    if (!editedUser) {
      return res.status(404).json({ message: "User not found"});
    }

    res.status(200).json({ message: "User updated succesfully", user: editedUser });
  } catch (error) {

    res.status(500).json({ message: "Server error, failed to edit user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error"});
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    if (!req.body) {
      return res.status(406).json({ message: "Fields cannot be empty" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    const redirectUrl = `/profile/${user._id}`;

    res.status(200).json({ message: `Login successful, logged in as ${user}`, loginToken: token, redirectUrl: redirectUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error, failed to login user" });
  }
}
