import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";

import snapshotGasCost from "./snapshots";

import {
  Req,
  Req__factory,
  MyToken,
  MyToken__factory,
} from "../typechain-types";

async function deployFixture() {
  const [owner] = await ethers.getSigners();

  const token = await new MyToken__factory(owner).deploy();

  const req = await new Req__factory(owner).deploy();

  const users = await ethers.getSigners();
  for (let i = 0; i < users.length; i++) {
    await token.mint(users[i].address, parseEther("1000"));
  }

  return { req, token };
}

describe("", () => {
  let owner: SignerWithAddress;
  let masterAddress: SignerWithAddress;
  let masterAddress2: SignerWithAddress;

  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;

  let req: Req;
  let token: MyToken;

  async function massApprove(x: number) {
    const users = await ethers.getSigners();
    users.shift();
    users.shift();
    users.shift();
    for (let i = 0; i < x; i++) {
      await token.connect(users[i]).approve(req.address, constants.MaxUint256);
      await req.connect(users[i]).addUser(token.address);
    }
  }

  beforeEach(async () => {
    ({ req, token } = await loadFixture(deployFixture));

    [owner, masterAddress, masterAddress2, user1, user2, user3, user4] =
      await ethers.getSigners();
  });

  it("Deploy contract gas", async () => {
    await snapshotGasCost(new Req__factory(owner).deploy());
  });

  describe("State and owner actions", () => {
    it("current owner", async () => {
      expect(await req.owner()).to.eq(owner.address);
    });

    it("transferOwnership", async () => {
      await expect(
        req.connect(user1).transferOwnership(masterAddress.address)
      ).to.revertedWithCustomError(req, "CallerIsNotTheOwner");

      await expect(
        req.connect(owner).transferOwnership(constants.AddressZero)
      ).to.revertedWithCustomError(req, "NewOwnerIsTheZeroAddress");

      await req.connect(owner).transferOwnership(masterAddress.address);

      expect(await req.owner()).to.eq(masterAddress.address);
    });

    it("transferOwnership gas", async () => {
      await snapshotGasCost(
        req.connect(owner).transferOwnership(masterAddress.address)
      );
    });

    it("add master address", async () => {
      await expect(
        req.connect(user1).addMasterAddress(masterAddress.address)
      ).to.revertedWithCustomError(req, "CallerIsNotTheOwner");

      await req.connect(owner).addMasterAddress(masterAddress.address);

      expect(await req.isMasterAddress(masterAddress.address)).to.eq(true);

      await expect(
        req.connect(owner).addMasterAddress(masterAddress.address)
      ).to.revertedWithCustomError(req, "MasterAddressAlreadyRegistered");
    });

    it("remove master address", async () => {
      await expect(
        req.connect(user1).deleteMasterAddress(masterAddress.address)
      ).to.revertedWithCustomError(req, "CallerIsNotTheOwner");

      await expect(
        req.connect(owner).deleteMasterAddress(masterAddress2.address)
      ).to.revertedWithCustomError(req, "MasterAddressIsNotRegistered");

      await req.connect(owner).addMasterAddress(masterAddress.address);

      await req.connect(owner).deleteMasterAddress(masterAddress.address);

      expect(await req.isMasterAddress(masterAddress.address)).to.eq(false);
    });

    it("add and remove master gas", async () => {
      await snapshotGasCost(
        req.connect(owner).addMasterAddress(masterAddress.address)
      );

      await snapshotGasCost(
        req.connect(owner).deleteMasterAddress(masterAddress.address)
      );
    });
  });

  describe("Token actions", async () => {
    beforeEach(async () => {
      await req.connect(owner).addMasterAddress(masterAddress.address);
      await req.connect(owner).addMasterAddress(masterAddress2.address);
    });

    it("addUser", async () => {
      await expect(
        req.connect(user1).addUser(token.address)
      ).to.revertedWithCustomError(req, "NewUserDidNotProvideApprove");

      await token.connect(user1).approve(req.address, constants.MaxUint256);

      await req.connect(user1).addUser(token.address);

      expect(await req.getUsersCountByToken(token.address)).to.eq(1);
      expect(await req.getUsersByTokenAddress(token.address)).to.deep.eq([
        user1.address,
      ]);
    });

    it("add user gas", async () => {
      await token.connect(user1).approve(req.address, constants.MaxUint256);
      await token.connect(user2).approve(req.address, constants.MaxUint256);
      await token.connect(user3).approve(req.address, constants.MaxUint256);

      await snapshotGasCost(req.connect(user1).addUser(token.address));
      await snapshotGasCost(req.connect(user2).addUser(token.address));
      await snapshotGasCost(req.connect(user3).addUser(token.address));
    });

    it("withdraw tokens", async () => {
      await expect(
        req
          .connect(user1)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      ).to.revertedWithCustomError(req, "CallerIsNotTheMasterAddress");

      await expect(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      ).to.revertedWithoutReason();

      await massApprove(3);

      await req
        .connect(masterAddress)
        .withdraw(
          token.address,
          await req.getAddressesForCollect(token.address)
        );
    });

    it("withdraw tokens 1 user gas", async () => {
      await massApprove(1);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 2 user gas", async () => {
      await massApprove(2);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 3 user gas", async () => {
      await massApprove(3);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 4 user gas", async () => {
      await massApprove(4);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 5 user gas", async () => {
      await massApprove(5);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 6 user gas", async () => {
      await massApprove(6);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 7 user gas", async () => {
      await massApprove(7);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 8 user gas", async () => {
      await massApprove(8);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 9 user gas", async () => {
      await massApprove(9);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 10 user gas", async () => {
      await massApprove(10);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 11 user gas", async () => {
      await massApprove(11);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 12 user gas", async () => {
      await massApprove(12);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 13 user gas", async () => {
      await massApprove(13);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 14 user gas", async () => {
      await massApprove(14);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 15 user gas", async () => {
      await massApprove(15);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 16 user gas", async () => {
      await massApprove(16);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );

      await token.mint(user1.address, parseEther("1"));
      await token.mint(user2.address, parseEther("1"));

      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });

    it("withdraw tokens 17 user gas", async () => {
      await massApprove(17);
      await snapshotGasCost(
        req
          .connect(masterAddress)
          .withdraw(
            token.address,
            await req.getAddressesForCollect(token.address)
          )
      );
    });
  });

  it("direct token transaction gas", async () => {
    await snapshotGasCost(
      token
        .connect(user1)
        .transfer(masterAddress.address, await token.balanceOf(user1.address))
    );
  });

  it("direct ether transaction gas", async () => {
    await snapshotGasCost(
      user1.sendTransaction({
        to: masterAddress.address,
        value: parseEther("1"),
      })
    );
  });
});
