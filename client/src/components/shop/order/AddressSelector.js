import React, { useState, useEffect } from "react";
import { Select, Input, Space, Row, Col } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import {
  getProvinces,
  getDistricts,
  getWards,
  formatFullAddress,
} from "../../../services/addressService";

const { Option } = Select;

const AddressSelector = ({ value, onChange, form }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [street, setStreet] = useState("");

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      const data = await getProvinces();
      setProvinces(data);
    };
    loadProvinces();
  }, []);

  // Handle province change
  const handleProvinceChange = async (code) => {
    const province = provinces.find((p) => p.code === code);
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    if (code) {
      const districtData = await getDistricts(code);
      setDistricts(districtData);
    }

    updateAddress(province?.name, null, null, street);
  };

  // Handle district change
  const handleDistrictChange = async (code) => {
    const district = districts.find((d) => d.code === code);
    setSelectedDistrict(district);
    setSelectedWard(null);
    setWards([]);

    if (code) {
      const wardData = await getWards(code);
      setWards(wardData);
    }

    updateAddress(
      selectedProvince?.name,
      district?.name,
      null,
      street
    );
  };

  // Handle ward change
  const handleWardChange = (code) => {
    const ward = wards.find((w) => w.code === code);
    setSelectedWard(ward);
    updateAddress(
      selectedProvince?.name,
      selectedDistrict?.name,
      ward?.name,
      street
    );
  };

  // Handle street change
  const handleStreetChange = (e) => {
    const value = e.target.value;
    setStreet(value);
    updateAddress(
      selectedProvince?.name,
      selectedDistrict?.name,
      selectedWard?.name,
      value
    );
  };

  // Update full address and call onChange
  const updateAddress = (province, district, ward, streetAddress) => {
    const fullAddress = formatFullAddress(
      streetAddress,
      ward,
      district,
      province
    );
    if (onChange) {
      onChange(fullAddress);
    }
    if (form) {
      form.setFieldsValue({ address: fullAddress });
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Tỉnh/Thành phố <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
          </div>
          <Select
            placeholder="Chọn tỉnh/thành phố"
            style={{ width: "100%" }}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={selectedProvince?.code}
            onChange={handleProvinceChange}
            notFoundContent={
              provinces.length === 0 ? "Đang tải..." : "Không tìm thấy"
            }
          >
            {provinces.map((province) => (
              <Option key={province.code} value={province.code}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Quận/Huyện <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
          </div>
          <Select
            placeholder="Chọn quận/huyện"
            style={{ width: "100%" }}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={selectedDistrict?.code}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            notFoundContent={
              districts.length === 0 && selectedProvince
                ? "Đang tải..."
                : "Vui lòng chọn tỉnh/thành phố trước"
            }
          >
            {districts.map((district) => (
              <Option key={district.code} value={district.code}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Phường/Xã <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
          </div>
          <Select
            placeholder="Chọn phường/xã"
            style={{ width: "100%" }}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={selectedWard?.code}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            notFoundContent={
              wards.length === 0 && selectedDistrict
                ? "Đang tải..."
                : "Vui lòng chọn quận/huyện trước"
            }
          >
            {wards.map((ward) => (
              <Option key={ward.code} value={ward.code}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Số nhà, tên đường <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
          </div>
          <Input
            placeholder="Ví dụ: 123 Nguyễn Văn A"
            size="large"
            value={street}
            onChange={handleStreetChange}
          />
        </Col>
      </Row>

      {/* Display full address preview */}
      {value && (
        <div
          style={{
            background: "#f0f2f5",
            padding: "12px",
            borderRadius: "6px",
            marginTop: "8px",
          }}
        >
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <span style={{ fontSize: "13px", color: "#595959" }}>
              <strong>Địa chỉ đầy đủ:</strong> {value}
            </span>
          </Space>
        </div>
      )}
    </Space>
  );
};

export default AddressSelector;

