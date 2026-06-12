const Member = require('../models/Member');
const { generateMemberId, paginate } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, gender, province, district, page, limit, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (province) query.province = province;
    if (district) query.district = district;

    const { skip, limit: docLimit, page: currentPage } = paginate(page, limit);
    const sortOption = sort || '-createdAt';

    const [members, total] = await Promise.all([
      Member.find(query).sort(sortOption).skip(skip).limit(docLimit),
      Member.countDocuments(query)
    ]);

    res.json({
      data: members,
      pagination: {
        page: currentPage,
        limit: docLimit,
        total,
        pages: Math.ceil(total / docLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ data: member });
  } catch (error) {
    next(error);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const memberId = await generateMemberId();
    const memberData = {
      ...req.body,
      memberId,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : undefined
    };

    const member = await Member.create(memberData);
    res.status(201).json({ message: 'Member created successfully', data: member });
  } catch (error) {
    next(error);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member updated successfully', data: member });
  } catch (error) {
    next(error);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMembersByLocation = async (req, res, next) => {
  try {
    const members = await Member.aggregate([
      {
        $group: {
          _id: { province: '$province', district: '$district', sector: '$sector', cell: '$cell', village: '$village' },
          count: { $sum: 1 },
          members: { $push: { id: '$_id', name: '$fullName', gender: '$gender' } }
        }
      },
      { $sort: { '_id.province': 1, '_id.district': 1 } }
    ]);

    res.json({ data: members });
  } catch (error) {
    next(error);
  }
};

exports.getLocations = async (req, res, next) => {
  try {
    const provinces = await Member.distinct('province');
    const locations = {};

    for (const province of provinces) {
      const districts = await Member.distinct('district', { province });
      const districtData = {};
      for (const district of districts) {
        const sectors = await Member.distinct('sector', { province, district });
        districtData[district] = sectors;
      }
      locations[province] = districtData;
    }

    res.json({ data: locations });
  } catch (error) {
    next(error);
  }
};
